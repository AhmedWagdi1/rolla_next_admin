# Vercel Environment Variables Setup

Add these exact values to your Vercel project:

**Project Settings → Environment Variables**

---

## FIREBASE_PROJECT_ID
```
rolla-q4037s
```

---

## FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-9ogrb@rolla-q4037s.iam.gserviceaccount.com
```

---

## FIREBASE_PRIVATE_KEY

**IMPORTANT**: Paste this value exactly as shown below, including the quotes:

```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWjeqpB45lALco\njByUIX/ySxffl5BbPIFQNQnmGR7UtaI5hEF1rTZoVDjT2rooV3ajWPT5oeDQOrxh\n/aM9dUxrJ7h9lV6Rl4+42wOTykMWyHW6sluinVI6RvPiFuyk7YLge9jIpVudsnlM\n9fhuBYgrjsNrSUQO6k+3EifXct7mefJSBlBFNJNigo6ZH5xEmug3OvJgP7ehQrvd\nq2uEwPDELZIOwGbIq1Xw7r2S8CzoeUG6KAB7g73qvvYxuV0GNYO5VzdqrICuteTD\n3uzjn+D0cdD/AK2Edre4Ty0Onu2DiWtH/QUqAxnG0lobeOb+duvNNlBCkPglV/ac\ndZ/FQ4BnAgMBAAECggEAU4rN8QQys2xsZRrtc9Z5efA4ewUKniP4nDESyihE44FY\nCfpP/NC1yzjkKcXUz6mC1gbo2JzqK1p7iNJYsjEO0PiV8zxqptkzisCo626J4gCr\nKseRO8fzQSLoisPvYCblW6CNoE8W1dgtOETcd4aq537+47MTD5W39WpZ3h/p4Cas\nKtPCgAknHBsG65I1XRPSWsR2lC77VvnpxXK1/dwBA/X6tqEgbW3op9JxZFH9JJH3\ntgOS7B5bhzUeBBgbsBbJW+fHe9BabvagW49MuDj0kw0VYVGvD4mlo7Rudb+n7vGy\np73rsIDaE9qLsr25wa7+wECyy7bxR6Q/JPnrbXopDQKBgQDrg8eTgSu2CSXn3agA\n4Ja2cBsJG2u7NgQWYjtoxmwDTNXpYetTMqxwkMeV40kmKgyJBTMefB5BFbJA7nK3\nOMFNVbNySqtJ+qCON5l0JsodyA+Hm9RKMv3q95br5m7lXJNDZvjG8oj6TOI6Jen6\nTyGhS4JpgLG8j17TbVHXo1wGHQKBgQDpN2kdL0yxspCFa5YsymzxkABAgAajFHX9\neUQL3ehF33voVOn+FkAptfml4+o+5uwqF9A95fZxUJ3XxorphCLDgGUXcjfVyWfX\nr+xdews279Wnlpixp8ojEa/SLo/PWGhbvVt3ZkaO2AQpwe4AlEJr74NJQHKU+DSm\nJ2Ozg0iJUwKBgQDYdh9ZwHA3eIMBcGW4oLOE7Na8cRp8T/JDzHeEHlMqWVWGkrwi\nlMGPGFKIvgT+cclhqojIbRW1hkZ2jXKcWiq4dJtg4aY7cYJeFFYTPo+n/bfgUOY2\naFWev39URFAKuSKU4bCn0kT5oO6QuUYrDM4BHJC5fVJe13s1YhXF11x+NQKBgCNF\ntigr1zWpBCKpuvTbSM7gMKmQs3BGz/GePaRt04t92YeyEBHV265zT2a/qdYJpv5W\ny7AQ780DnFveM3RN/9QBv0hkhf1XkNUWTnF1AqU0cOP/6ugzsGbNbgIj+Kwret0l\nLohId7NzCG4oXo7H3aPlfb2+eZX+VDgtDO9Bk97xAoGAGvx2cCH0K774G1cCFR/z\nT/jurd6bLmWNkAFZbtxCLUsZ0ajZxNfgfJKsEct3nz3ByBow03eZ38ZHvxUfesKr\nk38djdDGuxh9a6gj5jyjDDnN78LDvbgY3GUfwwd1TwXNcnQl8NizE4Pn5/FJjFmD\nd/GgauW/oap/CHnn+OAQ/Co=\n-----END PRIVATE KEY-----\n"
```

**Note**: The `\n` characters in the string above are LITERAL backslash-n (not actual newlines). This is the correct format for Vercel.

---

## FIREBASE_STORAGE_BUCKET (optional)
```
rolla-q4037s.appspot.com
```

---

## Steps to add in Vercel:

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Click **Add New**
   - Enter the **Key** (e.g., `FIREBASE_PROJECT_ID`)
   - Paste the **Value** exactly as shown above
   - Select all environments (Production, Preview, Development)
   - Click **Save**
4. After adding all variables, redeploy your project

---

## ⚠️ Security Note

Since this private key was previously committed to Git, you should rotate it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Find `firebase-adminsdk-9ogrb@rolla-q4037s.iam.gserviceaccount.com`
4. Click **Keys** → Delete the old key → **Add Key** → Create new key (JSON)
5. Download the new JSON file
6. Update the Vercel environment variables with the new values
7. Keep the new JSON file secure locally (it's gitignored)
