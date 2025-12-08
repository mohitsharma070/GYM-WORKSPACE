import { useEffect, useState } from "react";
import { getPlans } from "../services/membershipService";

export default function Plans() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getPlans()
      .then((data) => setPlans(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Available Plans</h1>

      {plans.map((p: any) => (
        <div key={p.id} className="p-4 border rounded my-2">
          <h3 className="font-semibold">{p.name}</h3>
          <p>{p.description}</p>
          <p>{p.price} INR</p>
          <p>Duration: {p.durationDays} days</p>
        </div>
      ))}
    </div>
  );
}
