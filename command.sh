# This is not for running, just reading

# Compile a Development Build, STILL NEED A SERVER to run
rm -rf android & npx expo prebuild --clean # optional
npx expo run:android --device

# Compile a Development Build, STILL NEED A SERVER to run
# produce an result apk file
eas build --profile development --local

# Compile a preview build
eas build --profile preview --local

# install apk file to the phone
adb install build-1777088305842.apk

# resolve conflict in some cases
adb shell pm uninstall com.anonymous.LisenareMobile

# Compile a Production Build, standalone to run
eas build --profile production --local
