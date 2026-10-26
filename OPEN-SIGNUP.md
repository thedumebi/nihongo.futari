# Opening go to the public: manual steps

The things to do by hand before any code changes: Cloudflare Turnstile
(about 10 minutes), and a Ko-fi page paid through a Japanese Stripe account,
with the money moved to Monzo in pounds by Wise (about 30 minutes, plus a few
days for Stripe to verify you).

**What goes back to Claude when you are done:**

- The Turnstile **site key**. It is public, so pasting it in chat is fine.
- Confirmation that the Turnstile **secret key** is in the env file. Never
  paste the secret itself anywhere.
- Your **Ko-fi page URL**.

**Have these ready before Part 3:** your Residence Card (在留カード), your
Japanese address, your Japanese mobile, and your Japanese bank account with
the holder name in katakana. For Part 5: your My Number and your Monzo sort
code and account number.

---

## Part 1: Cloudflare Turnstile

You already have the Cloudflare account: nagaya's Terraform runs the
`futari.live` zone, and `nihongo.futari.live` is a proxied record in it
(`nagaya/terraform/generated.auto.tfvars.json`). You only add one widget.

1. Log in at <https://dash.cloudflare.com> with the account that holds
   `futari.live`.
2. In the left sidebar, click **Turnstile**. If it is not there, type
   "Turnstile" in the search bar at the top of the dashboard.
3. Click **Add widget**.
4. **Widget name:** `go signup`. It is only a label.
5. **Hostname management:** click **Add hostnames** and choose `futari.live`
   from your existing zones. That alone is enough: a hostname covers all of
   its subdomains, so `nihongo.futari.live` is included. (Add only
   `nihongo.futari.live` instead if you want the key to work on nihongo and
   nowhere else.) Do not add `localhost`; development uses Cloudflare's
   [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/),
   which always pass.
6. **Widget mode:** **Managed**. Most people see only a tick; a checkbox
   appears only when Cloudflare is unsure.
7. **Pre-clearance:** **No**. It only matters if we later add a Cloudflare
   challenge rule on the zone, and it can be switched on then.
8. Click **Create**.
9. Copy the **Site key** and send it to Claude.
10. Copy the **Secret key** into your password manager. Never paste it in
    chat, a ticket or a commit in plain text.
11. From the root of this repo, encrypt the secret into the production env
    file:

    ```bash
    dotenvx set TURNSTILE_SECRET_KEY '<secret key>' -f nihongo/backend/.env.production
    ```

    This uses the public key already in that file, so the private key is not
    needed. The backend ignores the variable until the code that reads it
    ships, so setting it early is safe.
12. Open `nihongo/backend/.env.production` and check the new line reads
    `TURNSTILE_SECRET_KEY="encrypted:…"`, not the raw secret.
13. Commit that one file on its own (for example
    `Turnstile secret for signup`). Don't push until the code that uses it is
    ready, so they deploy together.
14. Tell Claude the secret is set.

**If the secret ever leaks:** Turnstile → the `go signup` widget →
**Rotate secret key**, then repeat steps 11 to 13.

> Later, outside this runbook: the widget could be managed in nagaya's
> Terraform (`cloudflare_turnstile_widget`) like the rest of the zone, and a
> Cloudflare rate-limiting rule on the sign-in code endpoint could stop abuse
> at the edge before it reaches the box.

---

## Part 2: Create the Ko-fi page

Ko-fi is the public page supporters see. It holds no money itself; Stripe
does that in Part 3.

1. Go to <https://ko-fi.com> and click **Sign up**.
2. Sign up with email, or with Google. If you used email, click the
   verification link Ko-fi sends.
3. Choose the page name. It becomes `ko-fi.com/<name>`, the link that goes in
   the app. Your own name is the best choice: one Ko-fi account has one page,
   and a personal page can take tips for go and anything you build later.
4. Set the display name to your name.
5. Upload a profile picture (a photo of you, or anything you like).
6. Write the **About** text so it names go without being only about it. A
   suggestion: *I build small, free things on my own, like go, a
   language-learning app. Tips help pay for the servers. Thank you!*
7. Skip **Shop**, **Commissions** and **Memberships**. Plain one-off tips
   carry no Ko-fi fee and nothing you have to deliver.
8. Turn on two-factor authentication in your Ko-fi account settings if it is
   offered.

---

## Part 3: Connect Stripe with your Japan details

While you live in Japan, the Stripe account is a Japanese one: Japanese
address, Japanese phone (which also fixes the SMS code), and payouts in yen
to a Japanese bank. A Japanese Stripe account cannot pay out to Monzo; Part 5
moves the money to Monzo in pounds. Ko-fi needs a full Stripe account;
[Stripe Express is not supported](https://help.ko-fi.com/hc/en-us/articles/360007522474-Connect-your-Stripe-account-and-start-earning).

1. On Ko-fi, click your avatar → **Settings** → **Payment** tab.
2. Next to **Stripe**, click **Connect**. A Stripe window opens.
3. No Stripe account yet: create one with your email and a password, and
   confirm the email Stripe sends. Already have one: log in.
4. **Country:** Japan.
5. **Business type:** **Individual** (個人事業主). Not a company.
6. Enter your **legal name, date of birth, Japanese address and Japanese
   mobile number** exactly as they appear on your Residence Card.
7. Enter the code Stripe texts to your Japanese number.
8. **Industry:** the closest match, such as *Software*.
9. **Website:** `https://nihongo.futari.live`
10. **Product description:** *Voluntary tips from users of a free
    language-learning web app. Nothing is sold.*
11. **Statement descriptor** (what supporters see on their bank statement):
    something like `GO LANGUAGE APP`, or keep Ko-fi's default.
12. **ID:** your **Residence Card (在留カード)**,
    [accepted by Stripe Japan](https://support.stripe.com/questions/getting-started-with-stripe-a-guide-for-users-in-japan).
13. **Payout account:** your Japanese bank account. The account holder name
    in **katakana must match the bank's record exactly**, or payouts fail.
    Japan Post Bank works but
    [uses its own format](https://support.stripe.com/questions/can-i-receive-payouts-to-japan-post-bank)
    (branch name, account type, account number, not the 記号/番号).
14. Turn on two-factor authentication when Stripe offers it.
15. Submit. Stripe sends you back to Ko-fi, where **Payment** shows Stripe as
    **Connected**.
16. Stripe may ask for more during onboarding because the account is
    Japanese; answer what it shows you. If verification is pending, wait for
    its email.

---

## Part 4: Finish Ko-fi and test

1. **Confirm your location.** On **Settings** → **Payment**, the blue banner
   *"Please confirm your location to continue accepting payments"* must be
   cleared, or the page shows no tip button at all. Click **confirm your
   location** and choose **Japan**, the same country as the Stripe account.
2. On the same tab, set the **Currency**. Your money always ends in yen, so
   **JPY** avoids Stripe's currency conversion fee on every tip. GBP or USD
   reads more naturally to supporters abroad, at the cost of that fee. Either
   works; JPY is the cheaper one.
3. Set the price of one "coffee".
4. Optionally write a **thank-you message** supporters see after they tip.
5. Open `ko-fi.com/<name>` in a private window. You should now see a
   **Tip** button and a "Buy a Coffee" box beside the About card. It can take
   a few minutes to appear after confirming your location. If it still
   doesn't, check the Stripe dashboard (**Settings** → **Business** →
   **Account status**) for anything it is waiting on.
6. Optionally ask a friend to tip as a real end-to-end test.
7. In the Stripe dashboard, payouts in Japan default to **manual**, and money
   becomes available 7 days after the first payment. Either click **Pay out**
   when you want it, or set an automatic schedule under **Settings** →
   **Payouts**.
8. Send the Ko-fi URL to Claude.

---

## Part 5: Move the money to Monzo in pounds

Every so often (quarterly is plenty), send the yen from your Japanese bank to
Monzo with Wise.

1. Sign up at <https://wise.com> with your Japanese address. Wise Japan
   verifies you with your Residence Card and My Number.
2. Add Monzo as a recipient: your name, Monzo **sort code** and **account
   number** (Monzo app → tap your account on Home → **Account details**).
3. Start a transfer: **send JPY, recipient gets GBP**.
4. Pay Wise by bank transfer from your Japanese account (the one Stripe pays
   into). Use the exact reference Wise gives you.
5. It lands in Monzo as a normal UK transfer, usually within a day or two.

Wise uses the mid-market rate; an older notice put the fee at about
[¥110 + 0.55%](https://bccjapan.com/news/moving-money-uk-transferwise-wise-fees-are-going-down).
Check the live calculator. The fixed part is why batching beats sending each
tip.

---

## Things to know

| Topic | What to expect |
|---|---|
| Ko-fi fee | [0% on one-off tips](https://help.ko-fi.com/hc/en-us/articles/360002506494) on the free plan; 5% on shop items, memberships and monthly tips |
| Card fee | Stripe Japan's normal card fee, plus a conversion fee if the Ko-fi currency is not JPY |
| Where money sits | Supporter → Stripe → your Japanese bank → (Wise) → Monzo. [Ko-fi never holds it](https://help.ko-fi.com/hc/en-us/articles/360013140633) |
| Payout timing | First payout available 7 days after the first payment; manual by default in Japan |
| Monzo while abroad | Monzo is meant for UK residents, and how it treats long stays abroad is a grey area. Keep the Japanese account working as the fallback |
| Tax | While you live in Japan the tips are Japanese income (雑所得). If you are salaried and side income stays under ¥200,000 a year you likely need not file; check before it grows |
| Moving back to the UK | Open a UK Stripe account then and connect Monzo directly; Part 5 goes away |

Keep the wording in the app clearly optional: a tip that unlocks nothing
stays a gift; one that unlocks features becomes a sale, with consumer-law
duties.

---

## Checklist

- [ ] Turnstile widget `go signup` created for `nihongo.futari.live`
- [ ] Site key sent to Claude
- [ ] `TURNSTILE_SECRET_KEY` encrypted into `nihongo/backend/.env.production`
      and committed, not pushed
- [ ] Ko-fi page live, Japanese Stripe connected, Japanese bank as the payout
      account
- [ ] Location confirmed on Ko-fi and the tip box visible in a private window
- [ ] Ko-fi URL sent to Claude
- [ ] Wise set up with Monzo as a recipient (any time before the first
      transfer)

Then the code work, in order: rate limiting and Turnstile on everything that
sends email → the code-login flag and signup email verification → account
deletion → privacy page and work-in-progress notice → donate link →
`SIGNUP_MODE=open`.

## Switching signup on (after the code is reviewed and deployed)

Only once the code changes are merged and live. From the repo root:

```bash
dotenvx set SIGNUP_MODE open -f nihongo/backend/.env.production
dotenvx set EMAIL_CODE_SIGNIN false -f nihongo/backend/.env.production
```

Commit, push, and wait for the pipeline. Then, in a private window:

1. `/signup` shows the "personal project" notice, the Turnstile tick, and a
   password field (no "email me a code").
2. Sign up with a spare address and a password; a 6-digit code arrives;
   entering it signs you in.
3. `/login` opens on the password form; "Forgot your password, or never set
   one?" emails a code. This is how existing code-only accounts get a
   password now that codes no longer sign anyone in, so tell them.
4. Settings → **Delete account** on that spare account removes it.

To undo either: `dotenvx set` the old value (`invite`, `true`) and redeploy.

## Sources

- [Cloudflare Turnstile: Get started](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare Turnstile: Dashboard widget management](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/)
- [Ko-fi: Connect your Stripe account](https://help.ko-fi.com/hc/en-us/articles/360007522474-Connect-your-Stripe-account-and-start-earning)
- [Ko-fi: Getting started](https://help.ko-fi.com/hc/en-us/articles/360014098514-Getting-started-on-Ko-fi)
- [Ko-fi: Does Ko-fi take a fee?](https://help.ko-fi.com/hc/en-us/articles/360002506494)
- [Ko-fi: Supporter payments FAQ](https://help.ko-fi.com/hc/en-us/articles/360013140633)
- [Stripe: Getting started in Japan](https://support.stripe.com/questions/getting-started-with-stripe-a-guide-for-users-in-japan)
- [Stripe: Payouts to Japan Post Bank](https://support.stripe.com/questions/can-i-receive-payouts-to-japan-post-bank)
- [Stripe: Opening an account in another country](https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-another-country)
- [Wise JPY to GBP fees (older notice)](https://bccjapan.com/news/moving-money-uk-transferwise-wise-fees-are-going-down)
