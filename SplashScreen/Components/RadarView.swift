import SwiftUI

// MARK: - Radar

struct RadarView: View {
    @State private var sweepAngle: Double = 0
    let size: CGFloat = 280

    private let green = Color(red: 0.29, green: 0.87, blue: 0.50)

    var body: some View {
        ZStack {
            // ── Rings ──────────────────────────────
            ForEach([1.0, 0.75, 0.43], id: \.self) { scale in
                Circle()
                    .stroke(green.opacity(0.12 + (1.0 - scale) * 0.18), lineWidth: 0.8)
                    .frame(width: size * scale, height: size * scale)
            }

            // ── Tick lines ─────────────────────────
            ForEach([0.0, 45.0, 90.0, 135.0], id: \.self) { angle in
                Rectangle()
                    .fill(green.opacity(0.12))
                    .frame(width: size / 2, height: 0.8)
                    .offset(x: size / 4)
                    .rotationEffect(.degrees(angle))
            }

            // ── Sweep (angular gradient + rotation) ─
            AngularGradient(
                stops: [
                    .init(color: .clear,               location: 0.00),
                    .init(color: green.opacity(0.26),  location: 0.15),
                    .init(color: .clear,               location: 0.20),
                    .init(color: .clear,               location: 1.00)
                ],
                center: .center
            )
            .clipShape(Circle())
            .frame(width: size, height: size)
            .rotationEffect(.degrees(sweepAngle))

            // ── Leading edge arm ───────────────────
            Rectangle()
                .fill(green.opacity(0.45))
                .frame(width: size / 2, height: 0.8)
                .offset(x: size / 4)
                .rotationEffect(.degrees(sweepAngle))

            // ── Ping dots ──────────────────────────
            PingDot(offset: CGSize(width:  48, height: -62), delay: 0.0)
            PingDot(offset: CGSize(width: -70, height:  28), delay: 1.3)
            PingDot(offset: CGSize(width:  30, height:  75), delay: 2.6)
        }
        .frame(width: size, height: size)
        .onAppear {
            withAnimation(
                .linear(duration: 4)
                .repeatForever(autoreverses: false)
            ) {
                sweepAngle = 360
            }
        }
    }
}

// MARK: - Ping Dot

struct PingDot: View {
    let offset: CGSize
    let delay: Double

    @State private var dotScale: CGFloat  = 0.4
    @State private var dotOpacity: Double = 0.0
    @State private var ringScale: CGFloat  = 1.0
    @State private var ringOpacity: Double = 0.8

    private let green = Color(red: 0.29, green: 0.87, blue: 0.50)

    var body: some View {
        ZStack {
            // Expanding ring
            Circle()
                .stroke(green.opacity(ringOpacity), lineWidth: 1)
                .frame(width: 13, height: 13)
                .scaleEffect(ringScale)

            // Solid dot
            Circle()
                .fill(green)
                .frame(width: 5, height: 5)
                .scaleEffect(dotScale)
                .opacity(dotOpacity)
        }
        .offset(offset)
        .onAppear {
            withAnimation(
                .easeInOut(duration: 2.0)
                .repeatForever()
                .delay(delay)
            ) {
                dotScale  = 1.0
                dotOpacity = 1.0
            }
            withAnimation(
                .easeOut(duration: 2.0)
                .repeatForever(autoreverses: false)
                .delay(delay)
            ) {
                ringScale   = 3.5
                ringOpacity = 0.0
            }
        }
    }
}

#Preview {
    ZStack {
        Color(red: 0.027, green: 0.039, blue: 0.027)
        RadarView()
    }
}
