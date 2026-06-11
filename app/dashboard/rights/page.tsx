import { Card } from "@/components/ui/Card";
import { getMockRightsData } from "@/lib/mock/api";

export default async function RightsPage() {
  const { topics, faqs, organizations } = await getMockRightsData();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold">זכויות</h2>
        <p className="text-muted">מידע על זכויות תעסוקתיות</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">נושאים מרכזיים</h3>
        {topics.map((topic) => (
          <Card key={topic.id}>
            <h4 className="font-medium">{topic.title}</h4>
            <p className="mt-2 text-sm text-muted">{topic.content}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">שאלות נפוצות</h3>
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <h4 className="font-medium">{faq.question}</h4>
            <p className="mt-2 text-sm text-muted">{faq.answer}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">גופים מסייעים</h3>
        {organizations.map((org) => (
          <Card key={org.id}>
            <a
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {org.name}
            </a>
            <p className="mt-1 text-sm text-muted">{org.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
