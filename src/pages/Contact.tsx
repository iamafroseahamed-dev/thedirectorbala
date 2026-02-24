import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Contact() {
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // Save to database
      const { error: dbError } = await supabase.from("contact_messages").insert([{
        name: data.name,
        email: data.email,
        message: data.message,
      }]);

      if (dbError) throw dbError;

      // Send email notification
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email notification");
      }

      setSubmitting(false);
      setSuccess(true);
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact — Bala</title>
        <meta name="description" content="Get in touch with film director Bala." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <p className="font-body text-xs text-gold tracking-[0.4em] uppercase mb-3">Get In Touch</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground">Contact</h1>
            <div className="gold-line w-20 mt-5" />
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <CheckCircle size={56} className="text-gold mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Message Sent</h2>
              <p className="font-body text-muted-foreground">Thank you for reaching out. I'll be in touch soon.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-8 font-body text-xs tracking-widest uppercase text-gold hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-secondary border-border focus:border-gold/50 font-body"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-destructive text-xs font-body">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="bg-secondary border-border focus:border-gold/50 font-body"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-destructive text-xs font-body">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="message"
                  {...register("message")}
                  rows={6}
                  className="bg-secondary border-border focus:border-gold/50 font-body resize-none"
                  placeholder="Tell me about your project..."
                />
                {errors.message && (
                  <p className="text-destructive text-xs font-body">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-body text-xs tracking-widest uppercase py-3 h-auto"
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </motion.form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

