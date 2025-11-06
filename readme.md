# 🏋️‍♂️ GymWatch

**GymWatch** is a cross-platform fitness tracking app built with **React Native** and **Expo**.  
Users can log exercises, record sets (weight, reps, and difficulty), and view past sessions.  
Data is stored locally for quick offline access.

---

## 🚀 Tech Stack

- **React Native (Expo)** — Core framework  
- **React Navigation** — App navigation  
- **React Native Gesture Handler** — Swipe to delete  
- **AsyncStorage** — Local persistence  
- **EAS Build & Submit** — For TestFlight & App Store releases  
- **React Native Vector Icons / Lucide** — Tab & action icons

---

## 🧰 Prerequisites

Before you begin, make sure you have:

- **Node.js** ≥ 18  
- **Yarn** (recommended)  
- **Expo CLI** installed globally  

  ```bash
  npm install -g expo-cli
  ```

- **Xcode** (latest version)  
- **Apple Developer Account** (already set up)  
- **Git** installed and configured  
- (Optional) **EAS CLI** for builds and submission  

  ```bash
  npm install -g eas-cli
  ```

---

## ⚙️ Installation & Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/joewatts000/gymwatch.git
   cd gymwatch
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

   or

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

   - Scan the QR code with the **Expo Go** app on your iPhone to test instantly.
   - Or press **i** to open it in the iOS simulator.

4. **File structure**

txt```
   /components     → Reusable UI components
   /screens        → App screens (Exercises, Log, Settings)
   /data           → AsyncStorage utilities
   app.json        → App configuration
   eas.json        → Build configuration

```txt

---

## 🧠 Git & Branching

**Main branch:** `main`  
All development should be done via feature branches.

```bash
git checkout -b feature/add-delete-exercise
# make your changes
git add .
git commit -m "feat: add swipe-to-delete on exercise list"
git push origin feature/add-delete-exercise
```

When ready:

- Open a **Pull Request (PR)** to `main`
- Request review
- Merge after approval

---

## 📱 Building for iOS

GymWatch uses **EAS Build** to create iOS builds and deploy to TestFlight or the App Store.

### 1. Log in to EAS

```bash
eas login
```

### 2. Configure project

Check your `eas.json` file:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "distribution": "app-store"
      },
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Build a new iOS release

```bash
eas build -p ios --profile production
```

EAS will:

- Bundle your app  
- Upload to Expo’s build servers  
- Produce an `.ipa` ready for submission  

---

## 🔁 Releasing a New Version to testflight

Every time you want to push a new TestFlight or App Store build:

1. **Increment version & build number** in `app.json`:

```json
   {
     "expo": {
       "version": "0.1.2",
       "ios": {
         "buildNumber": "2"
       }
     }
   }
```

- `version` = user-visible version (`0.1.2`)
- `buildNumber` = internal counter (must increase every submission)

2. **Run the build again**

```bash
   eas build -p ios --profile production
```

3. **Submit to TestFlight**

After your build finishes:

```bash
eas submit -p ios --latest
```

This uploads the latest `.ipa` to **App Store Connect** for **TestFlight** distribution.

Then go to:
👉 [https://appstoreconnect.apple.com/apps](https://appstoreconnect.apple.com/apps)

- Open your app  
- Go to the **TestFlight** tab  
- Add internal or external testers  
- Wait for Apple’s processing (takes 10–20 min)

**(Optional)** Submit to **App Store**

- Log into [App Store Connect](https://appstoreconnect.apple.com/)
- Go to **App Store → Prepare for Submission**
- Add screenshots, description, and select the latest build
- Click **Submit for Review**

---

## 🧾 App Store Connect Setup Summary

If new developers need access:

- Invite them in **App Store Connect → Users and Access**
- Assign the role **Developer** or **App Manager**
- Add them to the correct app under **Apps → Access**

---

## 🧪 Testing on Your iPhone

You can test in two ways:

1. **Expo Go (Instant)**
   - Run `npx expo start`
   - Scan QR code with the Expo Go app

2. **TestFlight (Production-like)**
   - Use the TestFlight invite link from App Store Connect
   - Install and open GymWatch from the TestFlight app

---

## 👥 Team Onboarding Summary

1. Clone the repo  
2. Run `yarn install`  
3. Start with `npx expo start`  
4. Log in to EAS if building for iOS  
5. Follow release steps above  
6. PRs must be reviewed before merging to `main`

---

## 🧑‍💻 Maintainers

**Author:** [@joewatts000](https://github.com/joewatts000)  
**Platform:** Expo + React Native  
**License:** MIT

---

## 🧩 Future Enhancements

- Cloud sync & login  
- Workout analytics  
- Graphs & trends  
- Shared workouts  
- iPad optimization
- Android
- Web

---
