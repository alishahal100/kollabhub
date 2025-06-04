import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);

    return new Response(
      JSON.stringify({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return new Response(JSON.stringify({ error: "User not found" }), { status: 500 });
  }
}
