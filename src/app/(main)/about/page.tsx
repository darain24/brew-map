/** About page for BrewMap */

export default function AboutPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">About BrewMap</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          BrewMap helps you discover cafes near you. Whether you&apos;re looking for a quiet spot
          to work, a place with great outdoor seating, or a pet-friendly coffee shop, we&apos;ve
          got you covered.
        </p>
        <p>
          Our app uses OpenStreetMap data to find real cafes in your area. Filter by WiFi
          availability, outdoor seating, pet-friendly options, and more to find your perfect
          spot.
        </p>
        <p>
          Save your favorite cafes and leave reviews to help other coffee lovers find their
          next great find. Finding your zen, one cup at a time.
        </p>
      </div>
    </div>
  );
}
