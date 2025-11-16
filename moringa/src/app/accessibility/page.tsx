import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Moringa Restaurant\'s commitment to digital accessibility and WCAG 2.1 AA compliance.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Accessibility Statement</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Commitment</h2>
            <p>
              Moringa Restaurant is committed to ensuring digital accessibility for people with disabilities. 
              We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Conformance Status</h2>
            <p>
              The <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Web Content Accessibility Guidelines (WCAG)</a> defines requirements for designers and developers to improve 
              accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
            </p>
            <p className="font-semibold">
              Moringa Restaurant is fully conformant with WCAG 2.1 level AA.
            </p>
            <p className="text-sm text-muted-foreground">
              Fully conformant means that the content fully conforms to the accessibility standard without any exceptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Accessibility Features</h2>
            <p>Our website includes the following accessibility features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Keyboard Navigation:</strong> Full keyboard support with enhanced focus indicators</li>
              <li><strong>Screen Reader Compatible:</strong> Proper ARIA labels and semantic HTML</li>
              <li><strong>Text Resizing:</strong> Four font size options (Small, Normal, Large, Extra Large)</li>
              <li><strong>Color Modes:</strong> Light, Dark, and System preference options</li>
              <li><strong>High Contrast Mode:</strong> Enhanced contrast for better readability</li>
              <li><strong>Color Blind Friendly:</strong> Uses patterns and shapes in addition to colors</li>
              <li><strong>Reduced Motion:</strong> Respects prefers-reduced-motion settings</li>
              <li><strong>Readable Fonts:</strong> Dyslexia-friendly font option</li>
              <li><strong>Enhanced Spacing:</strong> WCAG 1.4.12 compliant text spacing</li>
              <li><strong>Link Underlines:</strong> Option to always show link underlines</li>
              <li><strong>Skip Navigation:</strong> Skip to main content link for keyboard users</li>
              <li><strong>Touch Targets:</strong> Minimum 44x44px touch targets on mobile</li>
              <li><strong>Multi-language Support:</strong> English, Hebrew, and Arabic with RTL support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Accessing the Accessibility Menu</h2>
            <p>
              You can access our comprehensive accessibility menu by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clicking the accessibility button in the bottom-right corner of any page</li>
              <li>Pressing <kbd className="px-2 py-1 bg-muted rounded">Alt</kbd> + <kbd className="px-2 py-1 bg-muted rounded">A</kbd> on your keyboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Technical Specifications</h2>
            <p>
              Accessibility of Moringa Restaurant relies on the following technologies to work with the particular 
              combination of web browser and any assistive technologies or plugins installed on your computer:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>HTML5</li>
              <li>WAI-ARIA</li>
              <li>CSS</li>
              <li>JavaScript</li>
            </ul>
            <p>
              These technologies are relied upon for conformance with the accessibility standards used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Limitations and Alternatives</h2>
            <p>
              Despite our best efforts to ensure accessibility of Moringa Restaurant, there may be some limitations. 
              Below is a description of known limitations, and potential solutions. Please contact us if you observe 
              an issue not listed below.
            </p>
            <p>
              Known limitations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Third-party content:</strong> Some third-party embedded content may not be fully accessible. 
                We are working with providers to improve accessibility.
              </li>
              <li>
                <strong>User-uploaded images:</strong> We encourage users to provide alt text for images, 
                but cannot guarantee all user-generated content will be accessible.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Assessment Approach</h2>
            <p>
              Moringa Restaurant assessed the accessibility of this website by the following approaches:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Self-evaluation</li>
              <li>Automated testing using industry-standard tools</li>
              <li>Manual testing with keyboard navigation</li>
              <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
              <li>User testing with people with disabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Feedback</h2>
            <p>
              We welcome your feedback on the accessibility of Moringa Restaurant. Please let us know if you encounter 
              accessibility barriers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:accessibility@moringa.com" className="text-primary hover:underline">accessibility@moringa.com</a></li>
              <li>Phone: <a href="tel:+972525899214" className="text-primary hover:underline">+972 52-589-9214</a></li>
            </ul>
            <p>
              We try to respond to feedback within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Compatibility with Browsers and Assistive Technology</h2>
            <p>
              Moringa Restaurant is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recent versions of JAWS with Chrome, Firefox, or Edge</li>
              <li>Recent versions of NVDA with Firefox or Chrome</li>
              <li>Recent versions of VoiceOver with Safari on macOS and iOS</li>
              <li>Recent versions of TalkBack with Chrome on Android</li>
              <li>Dragon NaturallySpeaking</li>
              <li>ZoomText</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">Formal Complaints</h2>
            <p>
              We aim to respond to accessibility feedback within 2 business days, and to propose a solution within 10 business days. 
              You are entitled to escalate a complaint to the national authority, should you be dissatisfied with our response to you.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This statement was created using the <a href="https://www.w3.org/WAI/planning/statements/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              W3C Accessibility Statement Generator Tool</a>.
            </p>
          </section>

          <div className="mt-8 flex gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Return Home
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border-2 border-border rounded-lg hover:bg-muted transition-colors font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
