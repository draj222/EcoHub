import { HeroSection } from "@/components/ui/hero-section"

function HeroSectionDemo() {
  return (
    <HeroSection
      title="Welcome to EcoHub"
      subtitle={{
        regular: "Share your environmental ",
        gradient: "projects and research papers",
      }}
      description="Connect with like-minded individuals, share your environmental projects, research papers, and initiatives to make our planet greener."
      ctaText="Get Started"
      ctaHref="/projects/create"
      bottomImage={{
        light: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        dark: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.4,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  )
}

export { HeroSectionDemo } 