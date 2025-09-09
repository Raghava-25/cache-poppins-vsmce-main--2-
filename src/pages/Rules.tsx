import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import imgWeb from "@/assets/events/web.jpeg";
import imgPoster from "@/assets/events/poster.jpeg";
import imgTechExpo from "@/assets/events/techexpo.jpg";
import imgPython from "@/assets/events/python.jpeg";
import imgTechQuiz from "@/assets/events/techquiz.jpg";
import imgPhotography from "@/assets/events/photography.jpg";
import imgFreeFire from "@/assets/events/freefire.jpeg";
import imgDrawing from "@/assets/events/drawing.jpeg";
import imgBgmi from "@/assets/events/bgmi.webp";
import imgMeme from "@/assets/events/meme.jpeg";

type RuleSection = {
  id: string;
  title: string;
  image: string;
  rules: string[];
};

const ruleSections: RuleSection[] = [
  {
    id: "web-dev",
    title: "Web Development Challenge",
    image: imgWeb,
    rules: [
      "Teams of up to 3 members.",
      "Use any modern web stack; plagiarism not allowed.",
      "Working demo and short presentation required.",
      "Judging: UI/UX, performance, code quality, originality.",
    ],
  },
  {
    id: "poster",
    title: "Poster Presentation",
    image: imgPoster,
    rules: [
      "Solo or duo participation.",
      "A1 size poster; include abstract and references.",
      "5-minute presentation + 2-minute Q&A.",
    ],
  },
  {
    id: "tech-expo",
    title: "Tech Expo",
    image: imgTechExpo,
    rules: [
      "Hardware/Software prototypes welcome.",
      "Bring your own equipment and power strips.",
      "Demo must be safe and campus-compliant.",
    ],
  },
  {
    id: "pymaster",
    title: "PyMaster Contest",
    image: imgPython,
    rules: [
      "Solo event; Python 3 only.",
      "No internet access except docs provided.",
      "Scoring based on correctness and efficiency.",
    ],
  },
  {
    id: "tech-quiz",
    title: "Technical Quiz",
    image: imgTechQuiz,
    rules: [
      "Teams of 2.",
      "No electronic devices allowed.",
      "Ties resolved with rapid-fire round.",
    ],
  },
  {
    id: "photography",
    title: "Photography Contest",
    image: imgPhotography,
    rules: [
      "Submit RAW/JPG; basic edits permitted.",
      "Theme: Technology & Campus Life.",
      "Original work only; include EXIF if asked.",
    ],
  },
  {
    id: "free-fire",
    title: "Free Fire Esports",
    image: imgFreeFire,
    rules: [
      "Squad of 4 + 1 substitute.",
      "Tournament lobbies and rules shared on event day.",
      "Cheating or emulator use leads to disqualification.",
    ],
  },
  {
    id: "drawing",
    title: "Live Drawing",
    image: imgDrawing,
    rules: [
      "Theme announced on spot.",
      "Materials allowed: pencils, pens, colors (no digital).",
      "Time limit: 60 minutes.",
    ],
  },
  {
    id: "bgmi",
    title: "BGMI Esports Tournament",
    image: imgBgmi,
    rules: [
      "Squad of 4; TPP, classic custom rooms.",
      "No emulator/controllers; device check may occur.",
      "Follow lobby timings; absence counts as forfeit.",
    ],
  },
  {
    id: "meme-contest",
    title: "Tech Meme Contest",
    image: imgMeme,
    rules: [
      "Submit original memes (JPG/MP4).",
      "Keep content respectful; no hate/offense.",
      "Caption limit 200 characters.",
    ],
  },
];

const basicRules: string[] = [
  "Carry college ID and event ticket at all times.",
  "Follow volunteers’ instructions and campus guidelines.",
  "Decisions by judges/organizers are final.",
  "Any misconduct may lead to disqualification without refund.",
];

const Rules = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 text-gradient">Event Rules</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Please review the general rules and the specific rules for each event before participating.
          </p>
        </div>

        {/* Basic Rules */}
        <Card className="card-gradient border-border mb-12 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">General Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {basicRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Rules by Event */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
          {ruleSections.map((sec) => (
            <Card key={sec.id} className="card-gradient border-border overflow-hidden">
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${sec.image})` }}
              />
              <CardHeader>
                <CardTitle className="text-xl">{sec.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {sec.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Rules;


