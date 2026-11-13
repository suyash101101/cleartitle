//! ClearTitle — on-chain title insurance for ticket-earning seat NFTs.

use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, Vector};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, require, AccountId, BorshStorageKey, NearToken, PanicOnDefault, Promise,
};

pub type TokenId = String;

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
    pub owner_id: AccountId,
    pub vault_account_id: AccountId,
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
}

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    Seats,
    Pendings { token_id: String },
    Owners,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct Contract {
    club: Option<ClubConfig>,
    seats: UnorderedMap<TokenId, Seat>,
    pendings: LookupMap<TokenId, Vector<PendingPayout>>,
    next_payout_id: u64,
    token_owner: LookupMap<TokenId, AccountId>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            club: None,
            seats: UnorderedMap::new(StorageKey::Seats),
            pendings: LookupMap::new(b"p"),
            next_payout_id: 1,
            token_owner: LookupMap::new(StorageKey::Owners),
        }
    }

    pub fn create_club(
        &mut self,
        name: String,
        ticket_price: U128,
        seat_bps: Vec<u16>,
        treasury_bps: u16,
        royalty_bps: u16,
    ) {
        require!(self.club.is_none(), "club exists");
        let sum: u32 = seat_bps.iter().map(|b| *b as u32).sum::<u32>() + treasury_bps as u32;
        require!(sum == 10_000, "bps must sum to 10000");
        require!(!seat_bps.is_empty(), "need seats");
        require!(ticket_price.0 > 0, "ticket price");
        let organizer = env::predecessor_account_id();
        self.club = Some(ClubConfig {
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
        });
    }

    pub fn set_paused(&mut self, paused: bool) {
        let club = self.club.as_mut().expect("no club");
        require!(
            env::predecessor_account_id() == club.organizer,
            "only organizer"
        );
        club.paused = paused;
    }

    pub fn mint_seats(&mut self) {
        let club = self.club.as_ref().expect("no club").clone();
        require!(
            env::predecessor_account_id() == club.organizer,
            "only organizer"
        );
        require!(self.seats.is_empty(), "already minted");
        let contract_id = env::current_account_id();
        for i in 0..club.max_seats {
            let token_id = (i + 1).to_string();
            let vault = format!("seat-{}.{}", token_id, contract_id);
            let vault_account_id: AccountId = vault.parse().expect("vault id");
            let continuity = continuity_hash(&vault);
            let seat = Seat {
                token_id: token_id.clone(),
                owner_id: club.organizer.clone(),
                vault_account_id,
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
            self.token_owner.insert(&token_id, &club.organizer);
            self.seats.insert(&token_id, &seat);
            self.pendings.insert(
                &token_id,
                &Vector::new(StorageKey::Pendings {
                    token_id: token_id.clone(),
                }),
            );
        }
    }

    #[payable]
    pub fn buy_ticket(&mut self) {
        let mut club = self.club.as_ref().expect("no club").clone();
        require!(!club.paused, "paused");
        require!(self.seats.len() == club.max_seats as u64, "mint seats first");
        let payment = env::attached_deposit().as_yoctonear();
        require!(payment == club.ticket_price, "price mismatch");

        let treasury_cut = payment * club.treasury_bps as u128 / 10_000;
        let mut allocated = treasury_cut;
        let token_ids: Vec<_> = self.seats.keys().collect();
        for token_id in token_ids {
            let mut seat = self.seats.get(&token_id).unwrap();
            let amount = payment * seat.seat_bps as u128 / 10_000;
            seat.balance += amount;
            seat.tickets_accrued += 1;
            self.seats.insert(&token_id, &seat);
            allocated += amount;
        }
        let dust = payment.saturating_sub(allocated);
        club.treasury_balance += treasury_cut + dust;
        club.tickets_sold += 1;
        self.club = Some(club);
    }

    pub fn claim_payout(&mut self, token_id: TokenId, amount: U128) {
        let mut seat = self.seats.get(&token_id).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(seat.encumbrance == Encumbrance::Free, "encumbered");
        require!(amount.0 > 0 && amount.0 <= seat.balance, "bad amount");
        seat.balance -= amount.0;
        let id = self.next_payout_id;
        self.next_payout_id += 1;
        let mut vec = self.pendings.get(&token_id).unwrap();
        vec.push(&PendingPayout {
            id,
            token_id: token_id.clone(),
            amount: amount.0,
            status: PayoutStatus::Pending,
        });
        self.pendings.insert(&token_id, &vec);
        self.seats.insert(&token_id, &seat);
    }

    pub fn list_seat(&mut self, token_id: TokenId, ask: U128) -> u64 {
        let mut seat = self.seats.get(&token_id).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(seat.encumbrance == Encumbrance::Free, "encumbered");
        require!(ask.0 > 0, "ask");
        require!(seat.open_raw_sigs == 0, "open raw sigs");
        seat.encumbrance = Encumbrance::Listed;
        seat.listing_ask = Some(ask.0);
        seat.listing_nonce += 1;
        let nonce = seat.listing_nonce;
        self.seats.insert(&token_id, &seat);
        nonce
    }

    #[payable]
    pub fn buy_seat(&mut self, token_id: TokenId, sync_nonce: u64) {
        let mut club = self.club.as_ref().expect("no club").clone();
        let mut seat = self.seats.get(&token_id).expect("seat");
        require!(seat.encumbrance == Encumbrance::Listed, "not listed");
        let ask = seat.listing_ask.expect("ask");
        let payment = env::attached_deposit().as_yoctonear();
        require!(payment == ask, "ask mismatch");
        require!(sync_nonce == seat.listing_nonce, "stale nonce");
        let buyer = env::predecessor_account_id();
        require!(buyer != seat.owner_id, "self buy");

        seat.encumbrance = Encumbrance::Settling;
        let royalty = payment * club.royalty_bps as u128 / 10_000;
        club.treasury_balance += royalty;
        let seller = seat.owner_id.clone();
        let seller_amount = payment - royalty;

        let vec = self.pendings.get(&token_id).unwrap();
        let mut new_vec = Vector::new(StorageKey::Pendings {
            token_id: token_id.clone(),
        });
        for i in 0..vec.len() {
            let mut p = vec.get(i).unwrap();
            if p.status == PayoutStatus::Pending {
                p.status = PayoutStatus::ReboundToBuyer;
            }
            new_vec.push(&p);
        }
        self.pendings.insert(&token_id, &new_vec);

        seat.owner_id = buyer.clone();
        seat.key_epoch += 1;
        seat.open_raw_sigs = 0;
        seat.access_key_count = 0;
        seat.encumbrance = Encumbrance::Free;
        seat.listing_ask = None;
        self.token_owner.insert(&token_id, &buyer);
        self.seats.insert(&token_id, &seat);
        self.club = Some(club);

        Promise::new(seller).transfer(NearToken::from_yoctonear(seller_amount));
    }

    pub fn request_raw_sign(&mut self, token_id: TokenId) {
        let mut seat = self.seats.get(&token_id).expect("seat");
        require!(
            env::predecessor_account_id() == seat.owner_id,
            "only owner"
        );
        require!(
            seat.encumbrance == Encumbrance::Free,
            "epoch freeze: raw sign refused while seat encumbered"
        );
        seat.open_raw_sigs += 1;
        self.seats.insert(&token_id, &seat);
    }

    pub fn withdraw(&mut self, token_id: TokenId, amount: U128) {
        let mut seat = self.seats.get(&token_id).expect("seat");
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
        self.seats.insert(&token_id, &seat);
        Promise::new(env::predecessor_account_id())
            .transfer(NearToken::from_yoctonear(amount.0));
    }

    pub fn flag_wash(&mut self, token_id: TokenId) {
        let mut seat = self.seats.get(&token_id).expect("seat");
        seat.wash_flagged = true;
        self.seats.insert(&token_id, &seat);
    }

    pub fn get_club(&self) -> Option<ClubConfig> {
        self.club.clone()
    }

    pub fn get_seat(&self, token_id: TokenId) -> Option<Seat> {
        self.seats.get(&token_id)
    }

    pub fn nft_token(&self, token_id: TokenId) -> Option<Seat> {
        self.seats.get(&token_id)
    }

    pub fn get_pending(&self, token_id: TokenId) -> Vec<PendingPayout> {
        let Some(vec) = self.pendings.get(&token_id) else {
            return vec![];
        };
        (0..vec.len()).map(|i| vec.get(i).unwrap()).collect()
    }

    pub fn diligence(&self, token_id: TokenId) -> DiligenceView {
        let seat = self.seats.get(&token_id).expect("seat");
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
    let s = format!("{}|bitcoin|solana", vault);
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
            "Nearnight Live".into(),
            U128(10),
            vec![1000, 1000, 1000, 1000, 1000],
            5000,
            500,
        );
        c.mint_seats();
        c
    }

    #[test]
    fn bps_sum_required() {
        let mut c = Contract::new();
        testing_env!(context(accounts(0), 0).build());
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.create_club("x".into(), U128(10), vec![1000], 1000, 0);
        }));
        assert!(r.is_err());
    }

    #[test]
    fn keys_empty_after_mint() {
        let c = setup();
        let seat = c.get_seat("1".into()).unwrap();
        assert_eq!(seat.access_key_count, 0);
        assert!(seat.vault_account_id.as_str().contains("seat-1"));
    }

    #[test]
    fn ticket_splits_treasury_and_seats() {
        let mut c = setup();
        testing_env!(context(accounts(1), 10).build());
        c.buy_ticket();
        let club = c.get_club().unwrap();
        assert_eq!(club.treasury_balance, 5);
        assert_eq!(c.get_seat("1".into()).unwrap().balance, 1);
        assert_eq!(c.get_seat("3".into()).unwrap().balance, 1);
    }

    #[test]
    fn sale_mid_payout_rebinds_pending() {
        let mut c = setup();
        testing_env!(context(accounts(1), 10).build());
        c.buy_ticket();
        testing_env!(context(accounts(0), 0).build());
        c.claim_payout("3".into(), U128(1));
        let pending = c.get_pending("3".into());
        assert_eq!(pending[0].status, PayoutStatus::Pending);
        let nonce = c.list_seat("3".into(), U128(100));
        testing_env!(context(accounts(2), 100).build());
        c.buy_seat("3".into(), nonce);
        let seat = c.get_seat("3".into()).unwrap();
        assert_eq!(seat.owner_id, accounts(2));
        let pending = c.get_pending("3".into());
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
        c.list_seat("1".into(), U128(50));
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.request_raw_sign("1".into());
        }));
        assert!(r.is_err());
    }

    #[test]
    fn old_owner_withdraw_fails_after_sale() {
        let mut c = setup();
        testing_env!(context(accounts(1), 10).build());
        c.buy_ticket();
        testing_env!(context(accounts(0), 0).build());
        let nonce = c.list_seat("2".into(), U128(100));
        testing_env!(context(accounts(2), 100).build());
        c.buy_seat("2".into(), nonce);
        testing_env!(context(accounts(0), 0).build());
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            c.withdraw("2".into(), U128(1));
        }));
        assert!(r.is_err());
    }

    #[test]
    fn diligence_clean_when_healthy() {
        let c = setup();
        let d = c.diligence("1".into());
        assert_eq!(d.verdict, "PROVABLY CLEAN");
    }
}
