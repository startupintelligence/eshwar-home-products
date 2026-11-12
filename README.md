# Eshwar Home Products

Five-page responsive public website by Quantora Digital.

Pages: `index.html` (Home), `about.html` (Our story), `products.html` (Catalogue), `gallery.html` (Gallery), `contact.html` (Contact).

Shared files: `assets/css/site.css` and `assets/js/site.js`.

Image note: the current public preview uses CSS category illustrations, not real product photos. The previous artwork used fixed-height containers and `overflow:hidden`, which clipped decorative shapes. The new illustrations use aspect-ratio-based sizing and visible overflow. Future real photos should use `img{max-width:100%;height:auto}` and `object-fit:contain` when the entire product must remain visible.

Responsive breakpoints support 320–480px phones, tablet widths around 768px and desktop 1200px+. The mobile navigation is touch- and keyboard-accessible.

Build: `npm install` then `npm run build`. Product imagery remains illustrative until client-approved photographs are supplied. This is a catalogue/exploration site, not an e-commerce checkout.