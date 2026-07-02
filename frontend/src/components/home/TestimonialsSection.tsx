// TestimonialsSection — hidden until real client testimonials are available.
// The section is intentionally not rendered to avoid displaying placeholder data.
// To re-enable: replace TESTIMONIALS data in constants.ts with verified real content
// and remove the early-return below.

type Lang = 'ar' | 'en';
interface TestimonialsProps { lang: Lang; openBooking: (id?: string) => void; }
void (undefined as unknown as Lang); // keep type usage for TS

export function TestimonialsSection({ lang, openBooking }: TestimonialsProps) {
  void lang; void openBooking;
  // Intentionally returns null until real testimonials are ready.
  return null;
}
