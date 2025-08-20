import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    // Adopt UIScene lifecycle to quiet future assertion and align with modern iOS
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }

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
