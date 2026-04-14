# TFS Splash Screen

Animated SwiftUI launch screen for Think Forward Studio — military HUD aesthetic with radar sweep, scan line, ping dots, and staggered entrance animations.

---

## Xcode Setup

### 1. Create a new Xcode project

- Open Xcode → **File → New → Project**
- Choose **iOS → App**
- Set **Product Name** to `TFSSplash`
- Set **Interface** to `SwiftUI`
- Set **Language** to `Swift`
- Uncheck "Include Tests" (optional)

### 2. Replace generated files

Delete the default `ContentView.swift` and the app entry file Xcode generated, then drag **all files from this repo** into the Xcode project navigator. Make sure "Copy items if needed" is checked.

The file structure should look like this inside your Xcode project:

```
TFSSplash/
├── TFSSplashApp.swift
├── ContentView.swift
├── LaunchScreenView.swift
└── Components/
    ├── GridPattern.swift
    ├── CornerBrackets.swift
    ├── ScanLine.swift
    ├── RadarView.swift
    └── TFSBadge.swift
```

### 3. Integrating into an existing app

To use this splash screen in an existing app instead of a standalone project:

1. Copy `LaunchScreenView.swift` and the entire `Components/` folder into your project
2. In your app's entry point, wrap your root view with the splash logic from `TFSSplashApp.swift`:
   ```swift
   @State private var isLaunching = true

   var body: some Scene {
       WindowGroup {
           ZStack {
               if isLaunching {
                   LaunchScreenView()
                       .transition(.opacity)
                       .zIndex(1)
               } else {
                   YourMainView()  // ← replace with your app's root view
                       .transition(.opacity)
               }
           }
           .onAppear {
               DispatchQueue.main.asyncAfter(deadline: .now() + 2.8) {
                   withAnimation(.easeOut(duration: 0.5)) {
                       isLaunching = false
                   }
               }
           }
       }
   }
   ```
3. Disable the system launch screen in `Info.plist` (see below)

### 4. Disable the system launch screen

To prevent a white flash before the SwiftUI launch screen appears, open `Info.plist` and:

- **Delete** the `UILaunchStoryboardName` key (if present)
- **Add** a new key: `UILaunchScreen` → type `Dictionary` → leave it **empty**

In raw XML this looks like:
```xml
<key>UILaunchScreen</key>
<dict/>
```

### 5. Build & Run

Select an iPhone 15 Pro Max simulator (or any 6.5"+ device) and hit **Run (⌘R)**.

---

## Animation Sequence

| Element | Trigger | Duration |
|---|---|---|
| Scan line | Immediate, loops | 5s per pass |
| Radar sweep | Immediate, loops | 4s per revolution |
| Ping dots (×3) | Immediate, staggered | 2s, delays: 0 / 1.3 / 2.6s |
| Corner brackets | Immediate, breathe | 3s pulse |
| TFS Badge | `onAppear` | 1.2s fade + scale in |
| Status / telemetry | `onAppear` + 0.25s | 0.9s fade |
| Title block | `onAppear` + 0.6s | 1.0s fade + slide up |
| Data strip | `onAppear` + 1.1s | 0.8s fade |
| Hand-off to app | Auto after 2.8s | 0.5s opacity out |

---

## Customisation

| What | Where | Key |
|---|---|---|
| Accent color | All component files | `let green = Color(red: 0.29, green: 0.87, blue: 0.50)` |
| Background | `LaunchScreenView.swift` | `let bg = Color(red: 0.027, green: 0.039, blue: 0.027)` |
| Splash duration | `TFSSplashApp.swift` | `asyncAfter(deadline: .now() + 2.8)` |
| Radar size | `Components/RadarView.swift` | `let size: CGFloat = 280` |
| Coordinates | `LaunchScreenView.swift` | Data strip cells array |

---

## Requirements

- iOS 16+ (uses `AngularGradient` stops API)
- SwiftUI only — no third-party packages, no Timer/Combine dependencies
- All animations use `withAnimation` + `repeatForever`
- `#Preview` macros included in component files for isolated testing
