import { Capacitor } from '@capacitor/core'

export function isIosNativeApp() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('iosPreview') === '1') return true
  }

  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
}
