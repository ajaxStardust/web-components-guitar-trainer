# Patreon setup for the Guitar Trainer

A **Support on Patreon** link is already on the app (under the logo, next to “To instructions”). It currently points to:

**https://www.patreon.com/statecollegeguitarlessons**

Replace that URL with your real Patreon page once it’s live.

---

## 1. Create your Patreon page

1. Go to **https://www.patreon.com** and sign up (or log in).
2. Click **Create on Patreon** or **Become a creator**.
3. Choose **Creator** and complete the basics (page name, category, short description).

## 2. Set your page URL

- In **Settings → Page**, set your **Patreon URL** (e.g. `patreon.com/statecollegeguitarlessons` or your preferred name).
- That’s the link that will go in the app.

## 3. Add the link on the trainer

- Open **public/guitar-interactive-base.php**.
- Find the line with `href="https://www.patreon.com/statecollegeguitarlessons"`.
- Replace `statecollegeguitarlessons` with your actual Patreon username (or the full URL if you use a custom one).

## 4. Optional: tiers and goals

- **Membership tiers**: e.g. “Supporter”, “Student”, “Lesson pack” with different prices.
- **Goals**: e.g. “New backing tracks at 50 patrons.”
- **About**: Short blurb about State College Guitar Lessons and how support is used.

## 5. Promote it

- The button is already on **training.statecollegeguitarlessons.site**.
- You can also link Patreon from your main site and in the Tango instructions.

---

**Quick check:** After you create the page, open your Patreon URL in a browser. If that page loads, use the same URL in `guitar-interactive-base.php` and the app link will work.
