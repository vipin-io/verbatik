// // // File: app/components/Logo.tsx

// // // This is our reusable Logo component.
// // // We've pasted the SVG code for "Concept 1: The Abstract Signal" here.
// // // You can easily swap the SVG content with Concept 2 or 3 if you prefer.

// // export const Logo = () => (
// //   <svg
// //     width="40" // Slightly smaller for the header
// //     height="40"
// //     viewBox="0 0 48 48"
// //     fill="none"
// //     xmlns="http://www.w3.org/2000/svg"
// //     className="inline-block" // Allows it to sit next to text nicely
// //   >
// //     <path d="M8 16L12 16" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
// //     <path d="M10 24L14 24" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
// //     <path d="M8 32L12 32" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
// //     <path
// //       d="M20 24C26 12 32 36 40 24"
// //       stroke="#6366F1"
// //       strokeWidth="3"
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //     />
// //   </svg>
// // );

// // File: app/components/Logo.tsx
// // Updated to use Concept 3: The Thematic Tag

// export const Logo = () => (
// <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <defs>
//     <linearGradient id="prism-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//       <stop offset="0%" stop-color="#A78BFA"/>
//       <stop offset="100%" stop-color="#6366F1"/>
//     </linearGradient>
//   </defs>
//   <path d="M8 24H20" stroke="white" stroke-width="3" stroke-linecap="round"/>
//   <path d="M20 24L28 16L28 32L20 24Z" fill="url(#prism-grad)" fill-opacity="0.2" stroke="url(#prism-grad)" stroke-width="2"/>
//   <path d="M28 18L40 12" stroke="#A78BFA" stroke-width="3" stroke-linecap="round"/>
//   <path d="M28 24L40 24" stroke="#6366F1" stroke-width="3" stroke-linecap="round"/>
//   <path d="M28 30L40 36" stroke="#2DD4BF" stroke-width="3" stroke-linecap="round"/>
// </svg>

// );
export const Logo = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    {/* Simplified dual-triangle icon */}
    <defs>
      <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4EEBC4" />
        <stop offset="100%" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>
    <g transform="translate(16,12)">
      {/* Left triangle */}
      <path d="M0,40 L16,0 L32,40 Z" fill="url(#triGrad)" />
      {/* Right triangle, offset */}
      <path d="M16,40 L32,0 L48,40 Z" fill="#38BDF8" opacity="0.9" />
      {/* Minimal cactus silhouette */}
      <path
        d="M24,28 v-8 a2,2 0 0 0 -4,0 v8 m4,0 h4 v-6 a2,2 0 0 0 -4,0"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);




