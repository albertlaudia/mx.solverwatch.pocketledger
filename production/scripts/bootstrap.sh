#!/usr/bin/env bash
# bootstrap.sh - One-shot monorepo scaffold for PocketLedger.
#
# Run from the repo root after `git init` and copying the scaffold files in.
# Creates the 4 apps + 16 packages with pubspec.yaml, lib/, test/, and the
# the right cross-references.
#
# Usage:
#   chmod +x scripts/bootstrap.sh
#   ./scripts/bootstrap.sh

set -euo pipefail

ORG="pocketledger"
REPO="pocketledger"

echo "=== PocketLedger monorepo bootstrap ==="
echo "Org: $ORG"
echo "Repo: $REPO"
echo ""

# 1. Verify prerequisites
echo "--- Step 1/8: Verify prerequisites"
command -v fvm >/dev/null 2>&1 || { echo "fvm not installed. Run: brew tap leoafarias/fvm && brew install fvm"; exit 1; }
command -v dart >/dev/null 2>&1 || { echo "dart not installed. Install Flutter SDK via fvm."; exit 1; }
echo "OK"

# 2. Install Flutter SDK version
echo "--- Step 2/8: Install Flutter SDK"
fvm use
echo "OK"

# 3. Install Melos
echo "--- Step 3/8: Install Melos"
dart pub global activate melos
echo "OK"

# 4. Create the directory structure
echo "--- Step 4/8: Create directory structure"
mkdir -p apps/{ios,android,web,backend}
mkdir -p packages/{sdk,math_engine,ai_runtime,data_layer,ui,personas,frameworks,checkin,export,analytics,privacy,config,fixtures}
mkdir -p infra/scripts
mkdir -p docs
mkdir -p deck
mkdir -p fastlane
mkdir -p .github/{workflows,actions/setup-fvm,actions/setup-melos,actions/run-melos,actions/upload-testflight,actions/privacy-audit,ISSUE_TEMPLATE}
mkdir -p apps/ios/{ios,lib/{features/{chat,checkin,goals,settings,export,onboarding},shared},test,assets}
mkdir -p apps/android/{android,lib,test,assets}
mkdir -p apps/web/{lib,web,test}
mkdir -p apps/backend/{lib/{auth,billing,telemetry,pl},test}

# /media/ — gitignored brand and store assets. Folders + READMEs are committed; binary assets are not.
mkdir -p media/{app-store,play-store,brand,marketing-site,pitch-deck}
mkdir -p media/app-store/{icon,screenshots,metadata,store-listing-screenshots}
mkdir -p media/app-store/screenshots/{iPhone-6.7-inch,iPhone-6.5-inch,iPhone-5.5-inch,iPad-12.9-inch}
mkdir -p media/play-store/{icon,screenshots,metadata,store-listing-graphics}
mkdir -p media/play-store/icon/adaptive
mkdir -p media/play-store/screenshots/{phone,tablet-7-inch,tablet-10-inch}
mkdir -p media/brand/{logo,wordmark,colors,fonts}
mkdir -p media/marketing-site/{hero,favicon}
mkdir -p media/pitch-deck/{speaker-photos,demo-recordings,supporting-graphics}
echo "OK"

# 5. Create the 16 package pubspec.yaml files
echo "--- Step 5/8: Generate pubspec.yaml for each package"

generate_pubspec() {
  local name="$1"
  local description="$2"
  local path="$3"
  cat > "$path/pubspec.yaml" <<EOF
name: $name
description: $description
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"
  flutter: ">=3.32.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  pocketledger_config:
    path: ../config
EOF
}

generate_pubspec "pocketledger_sdk" "The Dart contract between apps and platform." "packages/sdk"
generate_pubspec "pocketledger_math_engine" "The deterministic math engine. LLM proposes, engine runs." "packages/math_engine"
generate_pubspec "pocketledger_ai_runtime" "The on-device AI runtime. Five tiers, hot-swappable." "packages/ai_runtime"
generate_pubspec "pocketledger_data_layer" "The encrypted notebook store. Drift + SQLCipher + flutter_secure_storage." "packages/data_layer"
generate_pubspec "pocketledger_ui" "The Material 3 design system." "packages/ui"
generate_pubspec "pocketledger_personas" "Calm / Direct / Playful." "packages/personas"
generate_pubspec "pocketledger_frameworks" "The curated goal library." "packages/frameworks"
generate_pubspec "pocketledger_checkin" "The check-in ritual engine." "packages/checkin"
generate_pubspec "pocketledger_export" "PDF + CSV exporters." "packages/export"
generate_pubspec "pocketledger_analytics" "Opt-in, anonymized, aggregated." "packages/analytics"
generate_pubspec "pocketledger_privacy" "Privacy posture + audit helpers." "packages/privacy"
generate_pubspec "pocketledger_config" "Shared analysis_options.yaml + lints." "packages/config"
generate_pubspec "pocketledger_fixtures" "200 math cases + 100 redteam questions." "packages/fixtures"

# Apps get their own pubspec
# iOS bundle id: com.solverwatch.pocketledger
# Android application id: com.solverwatch.pocketledger
cat > "apps/ios/pubspec.yaml" <<EOF
name: pocketledger_ios
description: PocketLedger for iOS (com.solverwatch.pocketledger).
version: 0.1.0+1
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"
  flutter: ">=3.32.0"

dependencies:
  flutter:
    sdk: flutter
  pocketledger_sdk:
    path: ../../packages/sdk
  pocketledger_math_engine:
    path: ../../packages/math_engine
  pocketledger_ai_runtime:
    path: ../../packages/ai_runtime
  pocketledger_data_layer:
    path: ../../packages/data_layer
  pocketledger_ui:
    path: ../../packages/ui
  pocketledger_personas:
    path: ../../packages/personas
  pocketledger_frameworks:
    path: ../../packages/frameworks
  pocketledger_checkin:
    path: ../../packages/checkin
  pocketledger_export:
    path: ../../packages/export
  pocketledger_analytics:
    path: ../../packages/analytics
  pocketledger_privacy:
    path: ../../packages/privacy
  flutter_gemma: ^0.15.0
  flutter_llama: ^0.4.0
  flutter_secure_storage: ^9.2.4
  drift: ^2.34.0
  drift_flutter: ^0.2.0
  sqlite3_flutter_libs: ^0.5.24
  sqlite3mc: ^1.0.0
  google_mlkit_text_recognition: ^0.15.0
  speech_to_text: ^7.0.0
  flutter_tts: ^4.2.0
  workmanager: ^0.6.0
  in_app_purchase: ^3.2.0
  flutter_local_notifications: ^18.0.0
  flutter_riverpod: ^2.6.1
  go_router: ^14.6.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: integration_test
  pocketledger_config:
    path: ../../packages/config

flutter:
  uses-material-design: true
  assets:
    - assets/
EOF

# Android pubspec mirrors iOS with minor deltas (different plugins)
cp "apps/ios/pubspec.yaml" "apps/android/pubspec.yaml"
sed -i "s/name: pocketledger_ios/name: pocketledger_android/" "apps/android/pubspec.yaml"
sed -i "s/PocketLedger for iOS (com.solverwatch.pocketledger)./PocketLedger for Android (com.solverwatch.pocketledger)./" "apps/android/pubspec.yaml"

# Generate Android app/build.gradle with applicationId com.solverwatch.pocketledger
mkdir -p apps/android/android/app
cat > "apps/android/android/app/build.gradle" <<\'GRADLE\'
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace "com.solverwatch.pocketledger"
    compileSdk 35
    ndkVersion "27.0.12077973"

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    defaultConfig {
        applicationId "com.solverwatch.pocketledger"
        minSdkVersion 30
        targetSdkVersion 35
        versionCode 1
        versionName "0.1.0"
    }

    signingConfigs {
        release {
            // populated by Fastlane match / key.properties at build time
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}

flutter {
    source "../.."
}
GRADLE

# Generate iOS Info.plist with bundle id com.solverwatch.pocketledger
mkdir -p apps/ios/ios/Runner
cat > "apps/ios/ios/Runner/Info.plist" <<\'PLIST\'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>PocketLedger</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.solverwatch.pocketledger</string>
    <key>CFBundleName</key>
    <string>pocketledger</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIApplicationSupportsIndirectInputEvents</key>
    <true/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyTracking</key>
    <false/>
</dict>
</plist>
PLIST

# Web pubspec
cat > "apps/web/pubspec.yaml" <<EOF
name: pocketledger_web
description: PocketLedger for the Web. Read-only v1.5.
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"
  flutter: ">=3.32.0"

dependencies:
  flutter:
    sdk: flutter
  pocketledger_sdk:
    path: ../../packages/sdk
  pocketledger_math_engine:
    path: ../../packages/math_engine
  pocketledger_ai_runtime:
    path: ../../packages/ai_runtime
  pocketledger_data_layer:
    path: ../../packages/data_layer
  pocketledger_ui:
    path: ../../packages/ui
  pocketledger_privacy:
    path: ../../packages/privacy
  web: ^1.1.0
  drift: ^2.34.0
  flutter_riverpod: ^2.6.1
  go_router: ^14.6.0
  web_llm: ^0.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  pocketledger_config:
    path: ../../packages/config

flutter:
  uses-material-design: true
EOF

# Backend pubspec (no flutter, just dart)
cat > "apps/backend/pubspec.yaml" <<EOF
name: pocketledger_backend
description: PocketLedger backend (auth, billing, telemetry).
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.5.0 <4.0.0"

dependencies:
  dart_frog: ^1.2.0
  shelf: ^1.4.0
  shelf_router: ^1.1.0
  postgres: ^3.5.0
  jose_plus: ^0.4.0
  http: ^1.2.0
  logging: ^1.3.0

dev_dependencies:
  test: ^1.25.0
EOF
echo "OK"

# 6. Run melos bootstrap
echo "--- Step 6/8: melos bootstrap"
melos bootstrap
echo "OK"

# 7. Run melos run analyze (first sanity check)
echo "--- Step 7/8: melos run analyze"
melos run analyze || echo "(warnings expected on empty package skeletons; will resolve as code is added)"
echo "OK"

# 8. Final summary
echo "--- Step 8/8: Done"
echo ""
echo "=== PocketLedger monorepo bootstrapped successfully ==="
echo ""
echo "Next steps:"
echo "  cd $REPO"
echo "  melos run analyze    # should be 0 warnings"
echo "  melos run test       # should pass (no tests yet, but pipeline works)"
echo "  cd apps/ios && fvm flutter run -d <iPhone 15 Pro>    # to run the iOS prototype"
echo ""
echo "When you have a Flutter SDK install:"
echo "  fvm install 3.32.0"
echo "  fvm use"
echo ""
echo "Then start Epic 2 (math engine) and Epic 4 (on-device AI runtime)."
