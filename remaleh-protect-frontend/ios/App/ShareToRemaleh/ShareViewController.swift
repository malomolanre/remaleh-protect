import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {
    override func isContentValid() -> Bool {
        // No validation necessary
        return true
    }

    override func didSelectPost() {
        if let inputItems = extensionContext?.inputItems as? [NSExtensionItem] {
            for item in inputItems {
                if let attachments = item.attachments {
                    for provider in attachments {
                        if provider.hasItemConformingToTypeIdentifier(kUTTypePlainText as String) {
                            provider.loadItem(forTypeIdentifier: kUTTypePlainText as String, options: nil) { (data, error) in
                                if let text = data as? String {
                                    let defaults = UserDefaults(suiteName: "group.com.remalehprotect")
                                    defaults?.set(text, forKey: "sharedText")
                                }
                                self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
                            }
                        }
                    }
                }
            }
        }
    }

    override func configurationItems() -> [Any]! {
        return []
    }
}
