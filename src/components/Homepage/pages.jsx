
import ClientStories from '../clientStories/clientStories';
import Footer from '../footer/Footer';
import Header from '../header/header';
import HeroSection from '../heroSection/heroSection';
import HowItWorks from '../howItWorks/howItWorks';
import Partition from '../partition/partition';
import Pointers from '../pointers/pointers';
import Search from '../search/search';
import ClientTestimonial from '../clientTestimonial/ClientTestimonial';
import Comparison from '../comparison/Comparison';
import RecentlySold from '../recentlySold/RecentlySold';
import ClientFAQs from '../clientFAQs/clientFAQs';
import Notification from '../notification/notification';

const HomePage = () => {

  return (
    <div className="homepage">
      <Header />
      <HeroSection />
      <Partition />
      <HowItWorks />
      <Search />
      <Pointers />
      <ClientStories />
      <ClientTestimonial />
      <Comparison />
      <RecentlySold />
      <ClientFAQs />
      <Notification />
      <Footer />
      
    </div>
  );
};

export default HomePage;
