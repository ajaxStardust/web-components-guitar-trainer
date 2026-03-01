# Buy Me a Coffee setup

The app has a **Buy me a coffee** button under the logo. It currently points to a placeholder. Follow these steps to create your page and plug in your link.

---

## 1. Create your account

1. Go to **https://www.buymeacoffee.com**
2. Click **Start my page** (or **Sign up**).
3. Sign up with **email** or **Google**.

---

## 2. Set your username (your link)

1. During signup, or in **Settings → General**, you’ll set your **username**.
2. Your public link will be: **https://www.buymeacoffee.com/YourUsername**
3. Pick something short and clear (e.g. `statecollegeguitar`, `scguitar`, or your name). You can’t change it later without contacting support.

---

## 3. Complete your page

1. **Profile**: Add a photo and a short bio (e.g. “Guitar teacher, State College. This trainer is free — tips help keep it that way.”).
2. **Story**: Optional. A few sentences about the trainer and why support helps.
3. **Goal** (optional): e.g. “Keep the trainer free and ad‑free” or a monthly goal amount.

---

## 4. Connect payouts

1. Go to **Settings → Payment**.
2. Add your **payout method** (bank account or PayPal). They’ll send payouts on a schedule (e.g. monthly or when you hit a threshold).
3. Confirm your identity if they ask (normal for payment platforms).

---

## 5. Put your link on the app

1. Open **public/guitar-interactive-base.php** in your project.
2. Find the line:  
   `href="https://www.buymeacoffee.com/yourpage"`
3. Replace **yourpage** with your actual BMC username.  
   Example: if your username is `statecollegeguitar`, use  
   `href="https://www.buymeacoffee.com/statecollegeguitar"`

Save the file. The button under the logo will now go to your real Buy Me a Coffee page.

---

## 6. Optional: custom amount

- In BMC, you can set a **default tip amount** (e.g. $5) and/or allow **custom amount**.
- Under **Settings** or **Page**, look for **Coffee price** / **Support amount** and set what you prefer.

---

## Quick checklist

- [ ] Sign up at buymeacoffee.com  
- [ ] Choose username (this becomes your link)  
- [ ] Add profile + short story (optional)  
- [ ] Add payout method  
- [ ] In `public/guitar-interactive-base.php`, replace `yourpage` in the BMC link with your username  

After that, the **Buy me a coffee** button on the trainer will point to your page and people can tip with card or PayPal through BMC.
