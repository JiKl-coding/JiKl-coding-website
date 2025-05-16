"use client"

import Image, { StaticImageData } from 'next/image'
import { useState } from 'react'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface ProjectCardProps {
  label: string
  href: string
  description: string
  stackDesc: string
  image: StaticImageData
  layout?: boolean // true = image left, false = image right
}

export default function ProjectCard({
  label,
  href = '#',
  description,
  stackDesc,
  image,
  layout = true,
}: ProjectCardProps) {
  const [flipped, setFlipped] = useState(false)
  const { locale } = useParams()

  const isCzech = locale === 'cs'

  const rotationClass = layout
    ? flipped
      ? 'rotate-y-180 group-hover:[transform:rotateY(210deg)]'
      : 'group-hover:[transform:rotateY(30deg)]'
    : flipped
      ? '-rotate-y-180 group-hover:[transform:rotateY(-210deg)]'
      : 'group-hover:[transform:rotateY(-30deg)]'

  return (
    <div
      className={clsx(
        'w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-center',
        !layout && 'lg:flex-row-reverse'
      )}
    >
      {/* Flip card wrapper */}
      <div
        className="relative w-full lg:w-1/2 h-64 sm:h-80 md:h-96 cursor-pointer group [perspective:1000px]"
        onClick={() => setFlipped((prev) => !prev)}
      >
        <div
          className={clsx(
            'relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]',
            rotationClass
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-sm overflow-hidden [backface-visibility:hidden]">
            {!flipped && (
              <>
                <Image
                  src={image}
                  alt={label}
                  fill
                  className="object-cover rounded-sm transition duration-300 ease-in-out
                            lg:group-hover:brightness-75"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold 
                            transition-opacity duration-300
                            lg:opacity-0 lg:group-hover:opacity-100
                            bg-black/20"
                >
                  <span>
                    {isCzech ? 'Klikni na mě' : 'Click me'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Back */}
          <div className={clsx(
            'absolute inset-0 rounded-sm bg-[var(--foreground)] text-[var(--background)] p-4 flex flex-col items-center justify-center text-center [backface-visibility:hidden]',
            layout
              ? 'rotate-y-180 group-hover:[transform:rotateY(180deg)]'
              : '-rotate-y-180 group-hover:[transform:rotateY(-180deg)]'
          )}>
            {flipped && (
              <>
                <h2 className="text-lg sm:text-xl md:text-2xl underline mb-2">Stack</h2>
                <p className="text-sm sm:text-md md:text-lg">{stackDesc}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Text section */}
      <div className="w-full lg:w-1/2 px-4 flex flex-col justify-start items-center">
        <Link href={href} 
          target="_blank"
          rel="noopener noreferrer">
          <h3 className="text-3xl font-bold mb-8 underline text-[var(--link)]">{label}</h3>
        </Link>
        <p className="text-muted-foreground text-lg sm:text-xl p-4 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}