import { useEffect } from "react"
import { Restaurant } from "../types/restaurantTypes"

interface AbandonedCartWatcherProps {
  cartSize: number
  selectedRestaurant: Restaurant
}

export function AbandonedCartWatcher({ cartSize, selectedRestaurant }: AbandonedCartWatcherProps) {
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (cartSize > 0) {
      timeout = setTimeout(async () => {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/alerts/abandoned-cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: selectedRestaurant.id,
              externalId: selectedRestaurant.externalId,
              restaurantName: selectedRestaurant.name,
              userId: selectedRestaurant.user,
            }),
          })

          const data = await response.json()
          return data
        } catch (err) {
          console.error("Erro ao chamar rota de alerta:", err)
        }
      }, 30 * 60 * 1000)
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [cartSize, selectedRestaurant])

  return null
}
