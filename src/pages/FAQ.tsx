import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import FAQSection from '../components/FAQSection';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';

const FAQ = () => {
  return (
    <div className="min-h-screen warm-page">
      <MetaTags 
        title="Frequently Asked Questions | Indigenous Rising AI"
        description="Find answers to common questions about Indigenous Rising AI, OCAP® principles, funding opportunities, training programs, and how our platform supports Indigenous entrepreneurs."
        keywords="FAQ, Indigenous business questions, OCAP, funding help, training programs, Indigenous Rising AI"
      />
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          {/* The page had no <h1> at all — broken heading hierarchy for screen
              readers and a weaker page for search. FAQSection starts at h2, so
              this supplies the document's single top-level heading. */}
          <h1 className="sr-only">
            Frequently Asked Questions — Indigenous Rising AI
          </h1>
        </div>
        <FAQSection includeSchema />
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
