import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(red: 0.027, green: 0.039, blue: 0.027)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Text("TFS")
                    .font(.system(size: 24, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(red: 0.29, green: 0.87, blue: 0.50))
                    .kerning(4)

                Text("THINK FORWARD STUDIO")
                    .font(.system(size: 12, weight: .regular, design: .monospaced))
                    .foregroundColor(Color(red: 0.29, green: 0.87, blue: 0.50).opacity(0.5))
                    .kerning(3)
            }
        }
    }
}

#Preview {
    ContentView()
}
