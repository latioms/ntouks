import { Signup } from '@/components/signup'
import { Car } from 'lucide-react'

export default function RegisterPage() {
  return (
    <Signup 
      heading="Inscription"
      logo={{
        url: "/",
        component: <Car className="h-10 w-10" />,
        alt: "Logo",
        title: "NTouks"
      }}
    />
  )
}
