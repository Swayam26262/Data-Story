"use client";

/**
 * ThemeTest Component
 * 
 * This component tests that all theme variables from globals.css are accessible
 * and properly applied. It can be temporarily added to any page for verification.
 */

export default function ThemeTest() {
  return (
    <div className="p-8 bg-background-dark text-text-primary">
      <h1 className="text-4xl font-bold text-primary mb-8">
        Theme Variables Test
      </h1>

      {/* Color Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card-bg border border-border-primary rounded-xl p-4">
            <div className="w-full h-20 bg-primary rounded-lg mb-2"></div>
            <p className="text-sm text-text-secondary">Primary: #39FF14</p>
          </div>
          <div className="bg-card-bg border border-border-primary rounded-xl p-4">
            <div className="w-full h-20 bg-secondary rounded-lg mb-2"></div>
            <p className="text-sm text-text-secondary">Secondary: #BF00FF</p>
          </div>
          <div className="bg-card-bg border border-border-primary rounded-xl p-4">
            <div className="w-full h-20 bg-card-bg border border-white rounded-lg mb-2"></div>
            <p className="text-sm text-text-secondary">Card BG: #0A0A0A</p>
          </div>
          <div className="bg-card-bg border border-border-primary rounded-xl p-4">
            <div className="w-full h-20 bg-card-hover rounded-lg mb-2"></div>
            <p className="text-sm text-text-secondary">Card Hover: #111111</p>
          </div>
        </div>
      </section>

      {/* Typography Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Typography</h2>
        <div className="bg-card-bg border border-border-primary rounded-xl p-6 space-y-4">
          <p className="text-text-primary font-normal">
            Font Family: Poppins (Normal Weight)
          </p>
          <p className="text-text-primary font-medium">
            Font Family: Poppins (Medium Weight)
          </p>
          <p className="text-text-primary font-semibold">
            Font Family: Poppins (Semibold Weight)
          </p>
          <p className="text-text-primary font-bold">
            Font Family: Poppins (Bold Weight)
          </p>
          <p className="text-text-primary font-black">
            Font Family: Poppins (Black Weight)
          </p>
        </div>
      </section>

      {/* Text Color Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Text Colors</h2>
        <div className="bg-card-bg border border-border-primary rounded-xl p-6 space-y-2">
          <p className="text-text-primary">Primary Text: #FFFFFF</p>
          <p className="text-text-secondary">Secondary Text: #D4D4D4</p>
          <p className="text-text-tertiary">Tertiary Text: #A0A0A0</p>
        </div>
      </section>

      {/* Shadow Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Shadows</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card-bg rounded-xl p-4 shadow-sm">
            <p className="text-sm text-text-secondary">shadow-sm</p>
          </div>
          <div className="bg-card-bg rounded-xl p-4 shadow-md">
            <p className="text-sm text-text-secondary">shadow-md</p>
          </div>
          <div className="bg-card-bg rounded-xl p-4 shadow-lg">
            <p className="text-sm text-text-secondary">shadow-lg</p>
          </div>
          <div className="bg-card-bg rounded-xl p-4 shadow-xl">
            <p className="text-sm text-text-secondary">shadow-xl</p>
          </div>
          <div className="bg-card-bg rounded-xl p-4 shadow-2xl">
            <p className="text-sm text-text-secondary">shadow-2xl</p>
          </div>
        </div>
      </section>

      {/* Border Radius Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Border Radius</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card-bg border border-border-primary rounded-sm p-4">
            <p className="text-sm text-text-secondary">rounded-sm</p>
          </div>
          <div className="bg-card-bg border border-border-primary rounded-md p-4">
            <p className="text-sm text-text-secondary">rounded-md</p>
          </div>
          <div className="bg-card-bg border border-border-primary rounded-lg p-4">
            <p className="text-sm text-text-secondary">rounded-lg</p>
          </div>
          <div className="bg-card-bg border border-border-primary rounded-xl p-4">
            <p className="text-sm text-text-secondary">rounded-xl</p>
          </div>
        </div>
      </section>

      {/* Button Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-background-dark px-6 py-3 rounded-xl font-semibold hover:bg-opacity-80 transition-opacity">
            Primary Button
          </button>
          <button className="bg-transparent text-secondary border-2 border-secondary px-6 py-3 rounded-xl font-semibold hover:bg-secondary/10 transition-colors">
            Secondary Button
          </button>
        </div>
      </section>

      {/* Card Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Card Example</h2>
        <div className="bg-card-bg border border-border-primary rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Sample Card
          </h3>
          <p className="text-text-secondary mb-4">
            This card demonstrates the complete theme styling with background, borders, shadows, and text colors.
          </p>
          <button className="bg-primary text-background-dark px-4 py-2 rounded-lg font-semibold hover:bg-opacity-80 transition-opacity">
            Action Button
          </button>
        </div>
      </section>

      {/* CSS Variables Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-secondary mb-4">CSS Variables</h2>
        <div className="bg-card-bg border border-border-primary rounded-xl p-6">
          <p className="text-text-secondary mb-2">
            All CSS custom properties are defined in <code className="text-primary">app/globals.css</code>
          </p>
          <ul className="list-disc list-inside space-y-1 text-text-tertiary text-sm">
            <li>Colors: primary, secondary, background-dark, card-bg, text colors</li>
            <li>Typography: font sizes (xs to 4xl), font weights</li>
            <li>Spacing: spacing-1 to spacing-16</li>
            <li>Shadows: shadow-sm to shadow-2xl</li>
            <li>Border Radius: radius-sm to radius-full</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
