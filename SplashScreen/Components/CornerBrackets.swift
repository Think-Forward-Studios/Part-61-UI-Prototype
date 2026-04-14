import SwiftUI

struct CornerBrackets: View {
    var armLength: CGFloat = 22
    var lineWidth: CGFloat = 1.5
    var inset: CGFloat = 20
    var color: Color = Color(red: 0.29, green: 0.87, blue: 0.50).opacity(0.55)

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let p = inset
            let s = armLength

            ZStack {
                // Top-left
                bracketPath(
                    from:   CGPoint(x: p + s, y: p),
                    corner: CGPoint(x: p,     y: p),
                    to:     CGPoint(x: p,     y: p + s)
                )
                // Top-right
                bracketPath(
                    from:   CGPoint(x: w - p - s, y: p),
                    corner: CGPoint(x: w - p,     y: p),
                    to:     CGPoint(x: w - p,     y: p + s)
                )
                // Bottom-left
                bracketPath(
                    from:   CGPoint(x: p,     y: h - p - s),
                    corner: CGPoint(x: p,     y: h - p),
                    to:     CGPoint(x: p + s, y: h - p)
                )
                // Bottom-right
                bracketPath(
                    from:   CGPoint(x: w - p,     y: h - p - s),
                    corner: CGPoint(x: w - p,     y: h - p),
                    to:     CGPoint(x: w - p - s, y: h - p)
                )
            }
        }
        .opacity(1)
        .animation(
            Animation.easeInOut(duration: 3).repeatForever(autoreverses: true),
            value: UUID()
        )
    }

    private func bracketPath(from: CGPoint, corner: CGPoint, to: CGPoint) -> some View {
        Path { path in
            path.move(to: from)
            path.addLine(to: corner)
            path.addLine(to: to)
        }
        .stroke(color, lineWidth: lineWidth)
    }
}

struct CornerBracketsAnimated: View {
    @State private var opacity: Double = 0.5

    var body: some View {
        CornerBrackets()
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
                    opacity = 1.0
                }
            }
    }
}
