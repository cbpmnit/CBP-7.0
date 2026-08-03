import Image from "next/image"

const team = [
  {
    name: "Dr. Niraja Saraswat",
    role: "Faculty Coordinator",
    department: "Dept. of Humanities & Social Sciences",
    image: "/assets/mnit-staff/dr-niraja-saraswat-upper-bg-removed.webp",
  },
  {
    name: "Prof. Nupur Tandon",
    role: "Training & Placement Officer",
    department: "Training & Placement Cell, MNIT Jaipur",
    image: "/assets/mnit-staff/prof-nupur-tandon-head-bg-removed.webp",
  },
  {
    name: "Rakesh",
    role: "Technical Lead",
    department: "Training & Placement Cell, MNIT Jaipur",
    image: "/assets/mnit-staff/rakesh.webp",
  },
]

export default function TeamSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-mnit-light px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
            Our Advisers
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
            Meet the Advisers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The CBP 7.0 is spearheaded by dedicated faculty members and the
            Training &amp; Placement Cell at MNIT Jaipur, ensuring a world-class
            learning experience for every participant.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-12 lg:gap-20">
          {team.map((member) => (
            <div
              key={member.name}
              className="group flex flex-col items-center text-center w-60"
            >
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-mnit-light shadow-lg transition duration-500 group-hover:border-mnit-blue/30 group-hover:shadow-xl">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="mt-5 text-base font-bold text-mnit-navy">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-mnit-blue">
                {member.role}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {member.department}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
