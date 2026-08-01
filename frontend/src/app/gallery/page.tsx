import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export const metadata = {
  title: "Gallery — CBP 7.0",
  description: "Explore moments from the CBP 7.0 program at MNIT Jaipur.",
}

const galleryImages = [
  { src: "/assets/mnit-staff/cbp photos.webp", alt: "CBP Program Photos", span: "md:col-span-2" },
  { src: "/assets/mnit-staff/3.webp", alt: "CBP Event Moment" },
  { src: "/assets/main-assets/home_1.webp", alt: "Program Session" },
  { src: "/assets/main-assets/home_2.webp", alt: "Workshop Activity" },
  { src: "/assets/seniors/AdityaRoy.webp", alt: "Participant Aditya Roy" },
  { src: "/assets/seniors/Akash Kumar.webp", alt: "Participant Akash Kumar" },
  { src: "/assets/seniors/ansh.webp", alt: "Participant Ansh" },
  { src: "/assets/seniors/AryanRaj.webp", alt: "Participant Aryan Raj" },
  { src: "/assets/seniors/ashana.webp", alt: "Participant Ashana" },
  { src: "/assets/seniors/BalveerSaini.webp", alt: "Participant Balveer Saini" },
  { src: "/assets/seniors/BhaveshNarnolia.webp", alt: "Participant Bhavesh Narnolia" },
  { src: "/assets/seniors/BhaveshYadav.webp", alt: "Participant Bhavesh Yadav" },
  { src: "/assets/seniors/DeekshaSinghal.webp", alt: "Participant Deeksha Singhal" },
  { src: "/assets/seniors/HardikDhoot.webp", alt: "Participant Hardik Dhoot" },
  { src: "/assets/seniors/Hardik.webp", alt: "Participant Hardik" },
  { src: "/assets/seniors/HaroonKaragwal.webp", alt: "Participant Haroon Karagwal" },
  { src: "/assets/seniors/HarshitKumar.webp", alt: "Participant Harshit Kumar" },
  { src: "/assets/seniors/harsh.webp", alt: "Participant Harsh" },
  { src: "/assets/seniors/KanikaSinghal.webp", alt: "Participant Kanika Singhal" },
  { src: "/assets/seniors/KomalWankhede.webp", alt: "Participant Komal Wankhede" },
  { src: "/assets/seniors/KoshalSharma.webp", alt: "Participant Koshal Sharma" },
  { src: "/assets/seniors/KrishnaAgarwal.webp", alt: "Participant Krishna Agarwal" },
  { src: "/assets/seniors/KrupaJoshi.webp", alt: "Participant Krupa Joshi" },
  { src: "/assets/seniors/KushalGarg.webp", alt: "Participant Kushal Garg" },
  { src: "/assets/seniors/NaveenSaini.webp", alt: "Participant Naveen Saini" },
  { src: "/assets/seniors/NehaTripathi.webp", alt: "Participant Neha Tripathi" },
  { src: "/assets/seniors/nikesh.webp", alt: "Participant Nikesh" },
  { src: "/assets/seniors/nikhil.webp", alt: "Participant Nikhil" },
  { src: "/assets/seniors/ParvAgrawal.webp", alt: "Participant Parv Agrawal" },
  { src: "/assets/seniors/priyanka.webp", alt: "Participant Priyanka" },
  { src: "/assets/seniors/RakshitJain.webp", alt: "Participant Rakshit Jain" },
  { src: "/assets/seniors/Ruby Gupta.webp", alt: "Participant Ruby Gupta" },
  { src: "/assets/seniors/RushilSinha.webp", alt: "Participant Rushil Sinha" },
  { src: "/assets/seniors/TusharChoudhary.webp", alt: "Participant Tushar Choudhary" },
  { src: "/assets/seniors/VimalDubey.webp", alt: "Participant Vimal Dubey" },
  { src: "/assets/seniors/VivekTapaniya.webp", alt: "Participant Vivek Tapaniya" },
]

export default function GalleryPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        <section className="bg-mnit-navy py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
                Gallery
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                CBP <span className="text-mnit-gold">Gallery</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-300">
                Capturing the spirit, energy, and transformative journey of CBP
                7.0 at MNIT Jaipur through the lens of our participants and
                organizers.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((img, i) => (
                <Reveal key={i} delay={(i % 8) * 60}>
                  <div
                    className={`group relative aspect-square overflow-hidden rounded-xl bg-gray-100 ${img.span || ""}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-mnit-navy/0 transition duration-300 group-hover:bg-mnit-navy/30" />
                    <p className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white opacity-0 transition duration-300 group-hover:opacity-100">
                      {img.alt}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
