import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SuccessGallery from '../components/SuccessGallery';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';

const SuccessStories = () => {
  return (
    <div className="min-h-screen warm-page">
      <MetaTags 
        title="Success Stories | Indigenous Rising AI"
        description="Explore Indigenous entrepreneur success stories and community impact across Canada."
        keywords="Indigenous success stories, entrepreneurship, community impact, Indigenous Rising AI"
      />
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <h1 className="sr-only">Success Stories — Indigenous Entrepreneurs Thriving Across Turtle Island</h1>
        </div>
        <SuccessGallery showCta={false} />
      </main>
      <Footer />
    </div>
  );
};

export default SuccessStories;
