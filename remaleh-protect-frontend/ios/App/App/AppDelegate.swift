import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    // Classic lifecycle; UIScene not used

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if #available(iOS 13.0, *) {
            if let statusBarFrame = UIApplication.shared.windows.first?.windowScene?.statusBarManager?.statusBarFrame {
                // Ensure the app content starts below the status bar/dynamic island by adjusting the window's safe area if needed
                _ = statusBarFrame // no-op, triggers initialization of status bar metrics
            }
        }
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
