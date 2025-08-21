import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    // Classic lifecycle; UIScene not used

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        let defaults = UserDefaults(suiteName: "group.com.remalehprotect")
        if let text = defaults?.string(forKey: "sharedText") {
            defaults?.removeObject(forKey: "sharedText")
            NotificationCenter.default.post(name: NSNotification.Name("SharedTextReceived"), object: text)
        }
    }
}
