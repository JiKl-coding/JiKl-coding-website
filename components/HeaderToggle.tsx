'use client'

import ToggleButton from "@/components/ToggleButton"

type Props = {
    locale: string
  }

  const HeaderToggle = ({ locale }: Props) => {
  
    return (
      <div className="flex gap-2 text-sm ml-6">
        <ToggleButton locale={locale as 'cs' | 'en'} />
      </div>
    )
  }
  
  export default HeaderToggle