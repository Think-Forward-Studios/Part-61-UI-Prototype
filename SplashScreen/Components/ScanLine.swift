import SwiftUI

struct ScanLine: View {
    @State private var offsetY: CGFloat = -4

    var body: some View {
        GeometryReader { geo in
            LinearGradient(
                colors: [
                    .clear,
                    Color(red: 0.29, green: 0.87, blue: 0.50).opacity(0.22),
                    .clear
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(height: 3)
            .offset(y: offsetY)
            .onAppear {
                offsetY = -4
                withAnimation(
                    .linear(duration: 5)
                    .repeatForever(autoreverses: false)
                ) {
                    offsetY = geo.size.height + 4
                }
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
}
