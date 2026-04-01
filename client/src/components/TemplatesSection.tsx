import template1 from "../assets/template-1.jpg";
import template2 from "../assets/template-2.jpg";
import template3 from "../assets/template-3.jpg";
import template4 from "../assets/template-4.jpg";

const TemplatesSection = () => {
  return (
    <section className="section-padding">
      <h2 className="heading-lg text-foreground mb-12 text-center">
        Show off with gorgeous drag-and-drop site templates.
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-4">
          <img src={template1} alt="Nature photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
        <div className="space-y-4 mt-8">
          <img src={template2} alt="Portrait photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
        <div className="space-y-4">
          <img src={template3} alt="Street photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
        <div className="space-y-4 mt-8">
          <img src={template4} alt="Landscape photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
