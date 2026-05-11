# This is not for running, just reading

# Compile a Development Build, need server to run
rm -rf android & npx expo prebuild --clean # optional
npx expo run:android --device

# Compile a Development Build, need server to run
# produce an result apk file
eas build --profile development --local

# install apk file to the phone
adb install build-1777088305842.apk

# resolve conflict in some cases
adb shell pm uninstall com.anonymous.LisenareMobile

# Compile a Production Build, standalone to run
eas build --local --profile production
