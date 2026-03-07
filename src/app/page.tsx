import { BlogSection } from "./(landing)/_components/blog";
import { ContactSection } from "./(landing)/_components/contact";
import { EducationSection } from "./(landing)/_components/education";
import { ExperienceSection } from "./(landing)/_components/experience";
import { Footer } from "./(landing)/_components/footer";
import { HeroSection } from "./(landing)/_components/hero";
import { Navbar } from "./(landing)/_components/navbar";
import { ProjectsSection } from "./(landing)/_components/projects";
import { SkillsSection } from "./(landing)/_components/skills";
import { TestimonialsSection } from "./(landing)/_components/testimonials";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <EducationSection />
        <BlogSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
