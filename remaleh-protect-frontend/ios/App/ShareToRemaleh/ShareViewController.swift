import UIKit
import Social
import UniformTypeIdentifiers

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
                        // Use the new UTType API for plain text
                        if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                            provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { (data, error) in
                                if let text = data as? String {
                                    let defaults = UserDefaults(suiteName: "group.com.remalehprotect")
                                    defaults?.set(text, forKey: "sharedText")
                                }
                                self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
                            }
                            return
                        }
                    }
                }
            }
        }
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}

