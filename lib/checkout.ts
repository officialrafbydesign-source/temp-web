export async function checkoutBeat(beat: {
  id: string
  title: string
  price: number
  image?: string
}) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: beat.id,
            name: beat.title,
            price: beat.price,
            quantity: 1,
            image: beat.image || null,
          },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error("Checkout failed")
    }

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      console.error("No checkout URL returned")
    }
  } catch (err) {
    console.error("Checkout error:", err)
  }
}