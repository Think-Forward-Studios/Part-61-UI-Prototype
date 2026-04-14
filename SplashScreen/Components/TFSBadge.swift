import SwiftUI

struct TFSBadge: View {
    @State private var glowRadius: CGFloat = 8
    let size: CGFloat = 68

    private let green = Color(red: 0.29, green: 0.87, blue: 0.50)

    var body: some View {
        ZStack {
            // Outer border
            Rectangle()
                .stroke(green.opacity(0.7), lineWidth: 1.5)
                .frame(width: size, height: size)

            // Notch — top center
            Rectangle()
                .fill(green.opacity(0.65))
                .frame(width: 10, height: 1.5)
                .offset(y: -(size / 2))

            // Notch — bottom center
            Rectangle()
                .fill(green.opacity(0.65))
                .frame(width: 10, height: 1.5)
                .offset(y: size / 2)

            // Label
            Text("TFS")
                .font(.system(size: 21, weight: .bold, design: .monospaced))
                .foregroundColor(green)
                .kerning(2)
        }
        .shadow(color: green.opacity(0.4), radius: glowRadius)
        .onAppear {
            withAnimation(
                .easeInOut(duration: 3)
                .repeatForever(autoreverses: true)
            ) {
                glowRadius = 24
            }
        }
    }
}

#Preview {
    ZStack {
        Color(red: 0.027, green: 0.039, blue: 0.027)
        TFSBadge()
    }
}
