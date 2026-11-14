//! CleanDeed — on-chain title insurance for ticket-earning seat NFTs.
//! One contract can host many venues (`club_id`); each venue has its own
//! ticket price, BPS split, and seat inventory.

use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, Vector};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, require, AccountId, BorshStorageKey, NearToken, PanicOnDefault, Promise,
};

pub type TokenId = String;
pub type ClubId = String;

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum Encumbrance {
    Free,
    Listed,
    Settling,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum PayoutStatus {
    Pending,
    Settled,
    ReboundToBuyer,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PendingPayout {
    pub id: u64,
    pub token_id: TokenId,
    pub amount: u128,
    pub status: PayoutStatus,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Seat {
    pub token_id: TokenId,
    pub club_id: ClubId,
    pub owner_id: AccountId,
    pub vault_account_id: AccountId,
    pub kind: String,
    pub encumbrance: Encumbrance,
    pub balance: u128,
    pub seat_bps: u16,
    pub tickets_accrued: u64,
    pub key_epoch: u64,
    pub listing_ask: Option<u128>,
    pub listing_nonce: u64,
    pub continuity_hash: String,
    pub access_key_count: u8,
    pub open_raw_sigs: u32,
    pub wash_flagged: bool,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct ClubConfig {
    pub club_id: ClubId,
    pub name: String,
    pub organizer: AccountId,
    pub ticket_price: u128,
    pub seat_bps: Vec<u16>,
    pub treasury_bps: u16,
    pub royalty_bps: u16,
    pub max_seats: u16,
    pub paused: bool,
    pub treasury_balance: u128,
    pub tickets_sold: u64,
    pub seat_kinds: Vec<String>,
}

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    Clubs,
    Seats,
    Pendings { key: String },
    Owners,
    Leases,
}

/// Time-boxed seat-cut lease. Title stays with owner; lessee may claim cuts until expiry.
/// `lessee = None` means an open offer; `Some` means an active renter.
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct LeaseState {
    pub lessee: Option<AccountId>,
    pub expires_ms: u64,
    pub ask: u128,
    pub nonce: u64,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct Contract {
    clubs: UnorderedMap<ClubId, ClubConfig>,
    /// Composite key `club_id#token_id`
    seats: UnorderedMap<String, Seat>,
    pendings: LookupMap<String, Vector<PendingPayout>>,
    next_payout_id: u64,
    token_owner: LookupMap<String, AccountId>,
    /// First-created / demo default for optional club_id args.
    active_club_id: Option<ClubId>,
    /// Optional seat-cut leases (`club_id#token_id` → LeaseState). Requires redeploy.
    leases: LookupMap<String, LeaseState>,
}

fn seat_storage_key(club_id: &str, token_id: &str) -> String {
    format!("{}#{}", club_id, token_id)
}

fn assert_club_id(club_id: &str) {
    require!(
        club_id.len() >= 2 && club_id.len() <= 32,
        "club_id length 2-32"
    );
    require!(
        club_id
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-' || c == '_'),
        "club_id charset"
    );
    require!(
        club_id
            .chars()
            .next()
            .map(|c| c.is_ascii_lowercase() || c.is_ascii_digit())
            .unwrap_or(false),
        "club_id start"
    );
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            clubs: UnorderedMap::new(StorageKey::Clubs),
            seats: UnorderedMap::new(StorageKey::Seats),
            pendings: LookupMap::new(b"p"),
            next_payout_id: 1,
            token_owner: LookupMap::new(StorageKey::Owners),
            active_club_id: None,
            leases: LookupMap::new(StorageKey::Leases),
        }
    }

    /// Wipe + re-init after WASM upgrade that adds `leases` / multi-venue views.
    /// Call as the contract account (FA key). Testnet specimen only.
    #[init(ignore_state)]
    pub fn migrate_reset() -> Self {
        require!(
            env::predecessor_account_id() == env::current_account_id(),
            "only contract account"
        );
        Self::new()
    }

    fn now_ms(&self) -> u64 {
        env::block_timestamp() / 1_000_000
    }

    /// Open offer or active renter still inside the expiry window.
    fn lease_blocks_title(&self, key: &String) -> bool {
        match self.leases.get(key) {
            Some(lease) => self.now_ms() < lease.expires_ms,
            None => false,
        }
    }

    /// Active renter (not merely an open offer).
    fn active_renter(&self, key: &String) -> Option<AccountId> {
        let lease = self.leases.get(key)?;
        if self.now_ms() < lease.expires_ms {
            lease.lessee
        } else {
            None
        }
    }

    fn resolve_club_id(&self, club_id: Option<ClubId>) -> ClubId {
        club_id
            .or_else(|| self.active_club_id.clone())
            .expect("no club — pass club_id or create_club first")
    }

    pub fn create_club(
        &mut self,
        club_id: ClubId,
        name: String,
        ticket_price: U128,
        seat_bps: Vec<u16>,
        treasury_bps: u16,
        royalty_bps: u16,
        seat_kinds: Option<Vec<String>>,
    ) {
        require!(self.clubs.get(&club_id).is_none(), "club exists");
        assert_club_id(&club_id);
        let sum: u32 = seat_bps.iter().map(|b| *b as u32).sum::<u32>() + treasury_bps as u32;
        require!(sum == 10_000, "bps must sum to 10000");
        require!(!seat_bps.is_empty(), "need seats");
        require!(ticket_price.0 > 0, "ticket price");
        let kinds = seat_kinds.unwrap_or_default();
        if !kinds.is_empty() {
            require!(kinds.len() == seat_bps.len(), "seat_kinds length");
        }
        let organizer = env::predecessor_account_id();
        let cfg = ClubConfig {
            club_id: club_id.clone(),
            name,
            organizer,
            ticket_price: ticket_price.0,
            max_seats: seat_bps.len() as u16,
            seat_bps,
            treasury_bps,
            royalty_bps,
            paused: false,
            treasury_balance: 0,
            tickets_sold: 0,
            seat_kinds: kinds,
        };
        self.clubs.insert(&club_id, &cfg);
        if self.active_club_id.is_none() {
            self.active_club_id = Some(club_id);
        }
    }

    pub fn set_paused(&mut self, paused: bool, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let mut club = self.clubs.get(&id).expect("no club");
        require!(
            env::predecessor_account_id() == club.organizer,
            "only organizer"
        );
        club.paused = paused;
        self.clubs.insert(&id, &club);
    }

    pub fn mint_seats(&mut self, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let club = self.clubs.get(&id).expect("no club").clone();
        require!(
            env::predecessor_account_id() == club.organizer,
            "only organizer"
        );
        // Refuse if any seat already exists for this club.
        let probe = seat_storage_key(&id, "1");
        require!(self.seats.get(&probe).is_none(), "already minted");
        let contract_id = env::current_account_id();
        for i in 0..club.max_seats {
            let token_id = (i + 1).to_string();
            let key = seat_storage_key(&id, &token_id);
            // Subaccount of the contract — unique per venue + seat.
            let vault = format!("s-{}-{}.{}", id, token_id, contract_id);
            require!(vault.len() <= 64, "vault account id too long");
            let vault_account_id: AccountId = vault.parse().expect("vault id");
            let continuity = continuity_hash(&vault);
            let kind = club
                .seat_kinds
                .get(i as usize)
                .cloned()
                .unwrap_or_else(|| format!("seat-{}", token_id));
            let seat = Seat {
                token_id: token_id.clone(),
                club_id: id.clone(),
                owner_id: club.organizer.clone(),
                vault_account_id,
                kind,
                encumbrance: Encumbrance::Free,
                balance: 0,
                seat_bps: club.seat_bps[i as usize],
                tickets_accrued: 0,
                key_epoch: 1,
                listing_ask: None,
                listing_nonce: 0,
                continuity_hash: continuity,
                access_key_count: 0,
                open_raw_sigs: 0,
                wash_flagged: false,
            };
            self.token_owner.insert(&key, &club.organizer);
            self.seats.insert(&key, &seat);
            self.pendings.insert(
                &key,
                &Vector::new(StorageKey::Pendings { key: key.clone() }),
            );
        }
    }

    #[payable]
    pub fn buy_ticket(&mut self, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let mut club = self.clubs.get(&id).expect("no club").clone();
        require!(!club.paused, "paused");
        let payment = env::attached_deposit().as_yoctonear();
        require!(payment == club.ticket_price, "price mismatch");

        let treasury_cut = payment * club.treasury_bps as u128 / 10_000;
        let mut allocated = treasury_cut;
        for i in 0..club.max_seats {
            let token_id = (i + 1).to_string();
            let key = seat_storage_key(&id, &token_id);
            let mut seat = self.seats.get(&key).expect("mint seats first");
            let amount = payment * seat.seat_bps as u128 / 10_000;
            seat.balance += amount;
            seat.tickets_accrued += 1;
            self.seats.insert(&key, &seat);
            allocated += amount;
        }
        let dust = payment.saturating_sub(allocated);
        club.treasury_balance += treasury_cut + dust;
        club.tickets_sold += 1;
        self.clubs.insert(&id, &club);
    }

    pub fn claim_payout(&mut self, token_id: TokenId, amount: U128, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut seat = self.seats.get(&key).expect("seat");
        let pred = env::predecessor_account_id();
        let is_owner = pred == seat.owner_id;
        let is_lessee = self.active_renter(&key).map(|l| l == pred).unwrap_or(false);
        require!(is_owner || is_lessee, "only owner or active lessee");
        require!(seat.encumbrance == Encumbrance::Free, "encumbered");
        require!(amount.0 > 0 && amount.0 <= seat.balance, "bad amount");
        seat.balance -= amount.0;
        let payout_id = self.next_payout_id;
        self.next_payout_id += 1;
        let mut vec = self.pendings.get(&key).unwrap();
        vec.push(&PendingPayout {
            id: payout_id,
            token_id: token_id.clone(),
            amount: amount.0,
            status: PayoutStatus::Pending,
        });
        self.pendings.insert(&key, &vec);
        self.seats.insert(&key, &seat);
    }

    pub fn list_seat(&mut self, token_id: TokenId, ask: U128, club_id: Option<ClubId>) -> u64 {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut seat = self.seats.get(&key).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(seat.encumbrance == Encumbrance::Free, "encumbered");
        require!(ask.0 > 0, "ask");
        require!(seat.open_raw_sigs == 0, "open raw sigs");
        require!(!self.lease_blocks_title(&key), "active lease blocks list");
        // Foreign-chain seal: bump sign epoch on list so held pre-list sigs are stale.
        seat.key_epoch += 1;
        seat.encumbrance = Encumbrance::Listed;
        seat.listing_ask = Some(ask.0);
        seat.listing_nonce += 1;
        let nonce = seat.listing_nonce;
        self.seats.insert(&key, &seat);
        nonce
    }

    pub fn delist_seat(&mut self, token_id: TokenId, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut seat = self.seats.get(&key).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(seat.encumbrance == Encumbrance::Listed, "not listed");
        seat.encumbrance = Encumbrance::Free;
        seat.listing_ask = None;
        self.seats.insert(&key, &seat);
    }

    #[payable]
    pub fn buy_seat(&mut self, token_id: TokenId, sync_nonce: u64, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut club = self.clubs.get(&id).expect("no club").clone();
        let mut seat = self.seats.get(&key).expect("seat");
        require!(seat.encumbrance == Encumbrance::Listed, "not listed");
        let ask = seat.listing_ask.expect("ask");
        let payment = env::attached_deposit().as_yoctonear();
        require!(payment == ask, "ask mismatch");
        require!(sync_nonce == seat.listing_nonce, "stale nonce");
        let buyer = env::predecessor_account_id();
        require!(buyer != seat.owner_id, "self buy");
        // On-chain title policy gate — same checks diligence uses for CLEAN.
        require!(seat.access_key_count == 0, "buy refused: vault keys present");
        require!(seat.open_raw_sigs == 0, "buy refused: open raw signatures");
        require!(!seat.wash_flagged, "buy refused: wash flagged — FIX BEFORE BUY");
        require!(!self.lease_blocks_title(&key), "buy refused: active lease");

        seat.encumbrance = Encumbrance::Settling;
        let royalty = payment * club.royalty_bps as u128 / 10_000;
        club.treasury_balance += royalty;
        let seller = seat.owner_id.clone();
        let seller_amount = payment - royalty;

        let vec = self.pendings.get(&key).unwrap();
        let mut new_vec = Vector::new(StorageKey::Pendings { key: key.clone() });
        for i in 0..vec.len() {
            let mut p = vec.get(i).unwrap();
            if p.status == PayoutStatus::Pending {
                p.status = PayoutStatus::ReboundToBuyer;
            }
            new_vec.push(&p);
        }
        self.pendings.insert(&key, &new_vec);

        seat.owner_id = buyer.clone();
        seat.key_epoch += 1;
        seat.open_raw_sigs = 0;
        seat.access_key_count = 0;
        seat.encumbrance = Encumbrance::Free;
        seat.listing_ask = None;
        self.token_owner.insert(&key, &buyer);
        self.leases.remove(&key);
        self.seats.insert(&key, &seat);
        self.clubs.insert(&id, &club);

        Promise::new(seller).transfer(NearToken::from_yoctonear(seller_amount));
    }

    /// Offer a time-boxed seat-cut lease. Title stays with owner.
    pub fn offer_lease(
        &mut self,
        token_id: TokenId,
        ask: U128,
        duration_ms: u64,
        club_id: Option<ClubId>,
    ) -> u64 {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let seat = self.seats.get(&key).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(seat.encumbrance == Encumbrance::Free, "encumbered");
        require!(ask.0 > 0, "ask");
        require!(duration_ms >= 60_000, "duration min 60s");
        require!(!self.lease_blocks_title(&key), "lease already active");
        let nonce = self.leases.get(&key).map(|l| l.nonce + 1).unwrap_or(1);
        let offer = LeaseState {
            lessee: None,
            expires_ms: self.now_ms() + duration_ms,
            ask: ask.0,
            nonce,
        };
        self.leases.insert(&key, &offer);
        nonce
    }

    #[payable]
    pub fn take_lease(
        &mut self,
        token_id: TokenId,
        sync_nonce: u64,
        club_id: Option<ClubId>,
    ) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let seat = self.seats.get(&key).expect("seat");
        require!(seat.encumbrance == Encumbrance::Free, "encumbered");
        let mut lease = self.leases.get(&key).expect("no lease offer");
        require!(lease.lessee.is_none(), "lease already taken");
        require!(sync_nonce == lease.nonce, "stale lease nonce");
        require!(self.now_ms() < lease.expires_ms, "lease offer expired");
        let payment = env::attached_deposit().as_yoctonear();
        require!(payment == lease.ask, "lease ask mismatch");
        let renter = env::predecessor_account_id();
        require!(renter != seat.owner_id, "owner cannot lease own seat");
        let seller = seat.owner_id.clone();
        lease.lessee = Some(renter);
        self.leases.insert(&key, &lease);
        Promise::new(seller).transfer(NearToken::from_yoctonear(payment));
    }

    /// Clear expired lease (owner or anyone after expiry).
    pub fn settle_lease(&mut self, token_id: TokenId, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let lease = self.leases.get(&key).expect("no lease");
        let pred = env::predecessor_account_id();
        let seat = self.seats.get(&key).expect("seat");
        let expired = self.now_ms() >= lease.expires_ms;
        require!(
            expired || pred == seat.owner_id,
            "lease still active — only owner can cancel"
        );
        self.leases.remove(&key);
    }

    pub fn get_lease(&self, token_id: TokenId, club_id: Option<ClubId>) -> Option<LeaseState> {
        let id = club_id.or_else(|| self.active_club_id.clone())?;
        let key = seat_storage_key(&id, &token_id);
        self.leases.get(&key)
    }

    pub fn request_raw_sign(&mut self, token_id: TokenId, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut seat = self.seats.get(&key).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(
            seat.encumbrance == Encumbrance::Free,
            "epoch freeze: raw sign refused while seat encumbered"
        );
        seat.open_raw_sigs += 1;
        self.seats.insert(&key, &seat);
    }

    pub fn withdraw(&mut self, token_id: TokenId, amount: U128, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut seat = self.seats.get(&key).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "withdraw refused: not current owner"
        );
        require!(
            seat.encumbrance == Encumbrance::Free,
            "withdraw refused: encumbered"
        );
        require!(amount.0 <= seat.balance, "insufficient");
        seat.balance -= amount.0;
        self.seats.insert(&key, &seat);
        Promise::new(env::predecessor_account_id())
            .transfer(NearToken::from_yoctonear(amount.0));
    }

    pub fn flag_wash(&mut self, token_id: TokenId, club_id: Option<ClubId>) {
        let id = self.resolve_club_id(club_id);
        let key = seat_storage_key(&id, &token_id);
        let mut seat = self.seats.get(&key).expect("seat");
        seat.wash_flagged = true;
        self.seats.insert(&key, &seat);
    }

    pub fn get_club(&self, club_id: Option<ClubId>) -> Option<ClubConfig> {
        let id = club_id.or_else(|| self.active_club_id.clone())?;
        self.clubs.get(&id)
    }

    pub fn list_clubs(&self) -> Vec<ClubId> {
        self.clubs.keys().collect()
    }

    pub fn get_active_club_id(&self) -> Option<ClubId> {
        self.active_club_id.clone()
    }

    pub fn get_seat(&self, token_id: TokenId, club_id: Option<ClubId>) -> Option<Seat> {
        let id = self.resolve_club_id(club_id);
        self.seats.get(&seat_storage_key(&id, &token_id))
    }

    /// All seats for a venue (or the active venue when club_id is omitted).
    pub fn list_seats(&self, club_id: Option<ClubId>) -> Vec<Seat> {
        let id = match club_id.or_else(|| self.active_club_id.clone()) {
            Some(v) => v,
            None => return vec![],
        };
        let Some(club) = self.clubs.get(&id) else {
            return vec![];
        };
        let mut out = Vec::with_capacity(club.max_seats as usize);
        for i in 0..club.max_seats {
            let token_id = (i + 1).to_string();
            if let Some(seat) = self.seats.get(&seat_storage_key(&id, &token_id)) {
                out.push(seat);
            }
        }
        out
    }

    pub fn nft_token(&self, token_id: TokenId, club_id: Option<ClubId>) -> Option<Seat> {
        self.get_seat(token_id, club_id)
    }

    pub fn get_pending(&self, token_id: TokenId, club_id: Option<ClubId>) -> Vec<PendingPayout> {
        let id = match club_id.or_else(|| self.active_club_id.clone()) {
            Some(v) => v,
            None => return vec![],
        };
        let key = seat_storage_key(&id, &token_id);
        let Some(vec) = self.pendings.get(&key) else {
            return vec![];
        };
        (0..vec.len()).map(|i| vec.get(i).unwrap()).collect()
    }

    pub fn diligence(&self, token_id: TokenId, club_id: Option<ClubId>) -> DiligenceView {
        let id = self.resolve_club_id(club_id);
        let seat = self
            .seats
            .get(&seat_storage_key(&id, &token_id))
            .expect("seat");
        let expected = continuity_hash(seat.vault_account_id.as_str());
        let checks = vec![
            CheckView {
                id: "keys".into(),
                pass: seat.access_key_count == 0,
                detail: format!("{} keys", seat.access_key_count),
            },
            CheckView {
                id: "continuity".into(),
                pass: seat.continuity_hash == expected,
                detail: seat.continuity_hash.clone(),
            },
            CheckView {
                id: "raw_sigs".into(),
                pass: seat.open_raw_sigs == 0,
                detail: format!("{} open", seat.open_raw_sigs),
            },
            CheckView {
                id: "wash".into(),
                pass: !seat.wash_flagged,
                detail: if seat.wash_flagged {
                    "FLAGGED".into()
                } else {
                    "clean".into()
                },
            },
        ];
        let clean = checks.iter().all(|c| c.pass);
        DiligenceView {
            token_id,
            verdict: if clean {
                "PROVABLY CLEAN".into()
            } else {
                "FIX BEFORE BUY".into()
            },
            checks,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct CheckView {
    pub id: String,
    pub pass: bool,
    pub detail: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct DiligenceView {
    pub token_id: TokenId,
    pub verdict: String,
    pub checks: Vec<CheckView>,
}

fn continuity_hash(vault: &str) -> String {
    // Domain-separated FNV-style digest mirrored by the SDK continuity helper intent.
    // Contract keeps a cheap on-chain form; SDK uses SHA-256 for address previews.
    let s = format!("quitclaim/continuity/v1|{}|bitcoin|solana", vault);
    let mut h: u32 = 0;
    for b in s.bytes() {
        h = h.wrapping_mul(31).wrapping_add(b as u32);
    }
    format!("cont_{:x}", h)
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn context(predecessor: AccountId, deposit: u128) -> VMContextBuilder {
        let mut b = VMContextBuilder::new();
        b.predecessor_account_id(predecessor);
        b.attached_deposit(NearToken::from_yoctonear(deposit));
        b
    }

    fn setup() -> Contract {
        let mut c = Contract::new();
        testing_env!(context(accounts(0), 0).build());
        c.create_club(
            "venue-a".into(),
            "Venue A".into(),
            U128(10),
            vec![1000, 1000, 1000, 1000, 1000],
            5000,
            500,
            Some(vec![
                "floor".into(),
                "lounge".into(),
                "suite".into(),
                "vip".into(),
                "press".into(),
            ]),
        );
        c.mint_seats(None);
        c
    }

    #[test]
    fn bps_sum_required() {
        let mut c = Contract::new();
        testing_env!(context(accounts(0), 0).build());
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.create_club("x".into(), "x".into(), U128(10), vec![1000], 1000, 0, None);
        }));
        assert!(r.is_err());
    }

    #[test]
    fn keys_empty_after_mint() {
        let c = setup();
        let seat = c.get_seat("1".into(), None).unwrap();
        assert_eq!(seat.access_key_count, 0);
        assert!(seat.vault_account_id.as_str().contains("s-venue-a-1"));
        assert_eq!(seat.kind, "floor");
        assert_eq!(seat.club_id, "venue-a");
        assert_eq!(c.list_seats(None).len(), 5);
    }

    #[test]
    fn ticket_splits_treasury_and_seats() {
        let mut c = setup();
        testing_env!(context(accounts(1), 10).build());
        c.buy_ticket(None);
        let club = c.get_club(None).unwrap();
        assert_eq!(club.treasury_balance, 5);
        assert_eq!(c.get_seat("1".into(), None).unwrap().balance, 1);
        assert_eq!(c.get_seat("3".into(), None).unwrap().balance, 1);
    }

    #[test]
    fn sale_mid_payout_rebinds_pending() {
        let mut c = setup();
        testing_env!(context(accounts(1), 10).build());
        c.buy_ticket(None);
        testing_env!(context(accounts(0), 0).build());
        c.claim_payout("3".into(), U128(1), None);
        let pending = c.get_pending("3".into(), None);
        assert_eq!(pending[0].status, PayoutStatus::Pending);
        let nonce = c.list_seat("3".into(), U128(100), None);
        testing_env!(context(accounts(2), 100).build());
        c.buy_seat("3".into(), nonce, None);
        let seat = c.get_seat("3".into(), None).unwrap();
        assert_eq!(seat.owner_id, accounts(2));
        let pending = c.get_pending("3".into(), None);
        assert_eq!(pending[0].status, PayoutStatus::ReboundToBuyer);
        assert_eq!(
            seat.continuity_hash,
            continuity_hash(seat.vault_account_id.as_str())
        );
    }

    #[test]
    fn held_sig_refused_while_listed() {
        let mut c = setup();
        testing_env!(context(accounts(0), 0).build());
        c.list_seat("1".into(), U128(50), None);
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.request_raw_sign("1".into(), None);
        }));
        assert!(r.is_err());
    }

    #[test]
    fn old_owner_withdraw_fails_after_sale() {
        let mut c = setup();
        testing_env!(context(accounts(1), 10).build());
        c.buy_ticket(None);
        testing_env!(context(accounts(0), 0).build());
        let nonce = c.list_seat("2".into(), U128(100), None);
        testing_env!(context(accounts(2), 100).build());
        c.buy_seat("2".into(), nonce, None);
        testing_env!(context(accounts(0), 0).build());
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.withdraw("2".into(), U128(1), None);
        }));
        assert!(r.is_err());
    }

    #[test]
    fn list_bumps_sign_epoch() {
        let mut c = setup();
        testing_env!(context(accounts(0), 0).build());
        let before = c.get_seat("1".into(), None).unwrap().key_epoch;
        let nonce = c.list_seat("1".into(), U128(50), None);
        let after = c.get_seat("1".into(), None).unwrap();
        assert_eq!(nonce, 1);
        assert_eq!(after.key_epoch, before + 1);
        assert_eq!(after.encumbrance, Encumbrance::Listed);
    }

    #[test]
    fn buy_refuses_wash_flag() {
        let mut c = setup();
        testing_env!(context(accounts(0), 0).build());
        c.flag_wash("1".into(), None);
        let nonce = c.list_seat("1".into(), U128(50), None);
        testing_env!(context(accounts(2), 50).build());
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.buy_seat("1".into(), nonce, None);
        }));
        assert!(r.is_err());
    }

    #[test]
    fn diligence_clean_when_healthy() {
        let c = setup();
        let d = c.diligence("1".into(), None);
        assert_eq!(d.verdict, "PROVABLY CLEAN");
    }

    #[test]
    fn multi_venue_independent_ticket_prices() {
        let mut c = setup();
        testing_env!(context(accounts(0), 0).build());
        c.create_club(
            "dayfest".into(),
            "Dayfest".into(),
            U128(25),
            vec![2500, 2500, 5000],
            0,
            250,
            Some(vec!["ga".into(), "balcony".into(), "box".into()]),
        );
        c.mint_seats(Some("dayfest".into()));
        assert_eq!(c.list_clubs().len(), 2);
        assert_eq!(c.get_club(Some("dayfest".into())).unwrap().ticket_price, 25);
        assert_eq!(c.get_club(Some("venue-a".into())).unwrap().ticket_price, 10);
        testing_env!(context(accounts(1), 25).build());
        c.buy_ticket(Some("dayfest".into()));
        assert_eq!(
            c.get_seat("1".into(), Some("dayfest".into()))
                .unwrap()
                .balance,
            6
        );
        // Nearnight seats untouched
        assert_eq!(c.get_seat("1".into(), Some("venue-a".into())).unwrap().balance, 0);
    }
}
