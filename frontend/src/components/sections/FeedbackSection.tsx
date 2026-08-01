import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"

const testimonials = [
  {
    name: "Diksha Gupta",
    rollNumber: "2021UME1409",
    quote:
      "I enrolled in the CBP program on the recommendation of my seniors, and it turned out to be a life-changing decision. The program taught me many practical applications from the Bhagavad Gita that helped me deal with stress, anxiety, and peer pressure while staying focused on my goals. It kept me away from the usual distractions of college life, where even the most dedicated students often get diverted. What I found most valuable was the circle of friends, seniors, and professors I met through CBP. Surrounded by such positive and inspiring people, I was able to maintain a good CGPA and secure two internships and two placement offers during my B.Tech. CBP has truly been a turning point in my academic and personal journey.",
    image: "/assets/seniors/DeekshaSinghal.webp",
  },
  {
    name: "Saurav Raj",
    rollNumber: "2022UEE1169",
    quote:
      "When I came to college, I was a very shy person and wasn't good at socializing. The first thing that CBP helped me with was building a feeling of community and socializing with new students that joined the program, which eventually helped me in developing a better personality. It was a very interesting program and was never boring. Secondly, I got a chance to hear from very senior and qualified leaders and their guidance helped me in my career too. To any newly joined students, I would suggest that they must attend this program as there are no losses, only gains.",
    image: "/assets/seniors/Akash Kumar.webp",
  },
  {
    name: "Amit Tiwari",
    rollNumber: "2022UME1200",
    quote:
      "Capacity Building Program affected my life very greatly. In this Program I learnt how should be our lifestyle. I learnt how to control the mind. There are many other things like why Bhagavad Gita is important for our life and how we can make our life blissful and disciplined by reading Bhagavad Gita. This Program teaches the value of life, goals and character. A disciplined and characterful life can help us to achieve our goals.",
    image: "/assets/seniors/ansh.webp",
  },
  {
    name: "Kuldeep Dadrwal",
    rollNumber: "2020UEC1645",
    quote:
      "The Capacity Building Program affected my life very greatly. Through this program I learned how valuable the Bhagavad Gita is as a guide for living a disciplined and meaningful life. I gained practical wisdom on managing the mind, staying focused on goals, and building character — tools that have shaped both my academic and personal growth in ways I never imagined possible.",
    image: "/assets/seniors/TusharChoudhary.webp",
  },
]

export default function FeedbackSection() {
  return (
    <section className="bg-mnit-light py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
              Student Feedback
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
              What Our Alumni Say
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Real stories from students whose lives were transformed by the
              Capacity Building Program.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg hover:border-mnit-blue/20">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-mnit-light shadow-sm">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-mnit-navy truncate">
                      {t.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {t.rollNumber}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex-1">
                  <svg
                    className="h-6 w-6 text-mnit-gold/60"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983z" />
                  </svg>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {t.quote}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-3.5 w-3.5 text-mnit-gold"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
