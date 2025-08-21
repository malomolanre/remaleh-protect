import Foundation
import AuthenticationServices
import CryptoKit
import Capacitor
// Capacitor plugin registration
@objc(AppleSignInPlugin)
@objcMembers
public class AppleSignInPlugin: CAPPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {


    @objc func signIn(_ call: CAPPluginCall) {
        print("[AppleSignInPlugin] signIn called")
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        // Generate a random nonce and set its SHA256 as per Apple guidelines
        let nonce = randomNonceString()
        self.currentNonce = nonce
        request.nonce = sha256(nonce)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
        print("[AppleSignInPlugin] performRequests invoked")

        self.currentCall = call
    }

    private var currentCall: CAPPluginCall?
    private var currentNonce: String?

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return self.bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        print("[AppleSignInPlugin] didCompleteWithAuthorization")
        guard let cred = authorization.credential as? ASAuthorizationAppleIDCredential else {
            self.currentCall?.reject("Invalid credential")
            self.currentCall = nil
            return
        }

        var result: [String: Any] = [:]
        if let tokenData = cred.identityToken, let tokenStr = String(data: tokenData, encoding: .utf8) {
            result["identityToken"] = tokenStr
        }
        if let codeData = cred.authorizationCode, let codeStr = String(data: codeData, encoding: .utf8) {
            result["authorizationCode"] = codeStr
        }
        if let nonce = self.currentNonce { result["nonce"] = nonce }
        if let email = cred.email { result["email"] = email }
        if let fullName = cred.fullName {
            result["fullName"] = PersonNameComponentsFormatter().string(from: fullName)
        }
        result["user"] = cred.user

        self.currentCall?.resolve(result)
        self.currentCall = nil
        self.currentNonce = nil
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        print("[AppleSignInPlugin] didCompleteWithError: \(error.localizedDescription)")
        self.currentCall?.reject(error.localizedDescription)
        self.currentCall = nil
        self.currentNonce = nil
    }

    // MARK: - Helpers
    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            let randoms: [UInt8] = (0..<16).map { _ in
                var random: UInt8 = 0
                let errorCode = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
                if errorCode != errSecSuccess { fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)") }
                return random
            }
            randoms.forEach { random in
                if remainingLength == 0 { return }
                if random < charset.count { result.append(charset[Int(random)]) ; remainingLength -= 1 }
            }
        }
        return result
    }
}


