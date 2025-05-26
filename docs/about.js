"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Users, Heart, Rocket, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Hero Section */}
        <motion.section
          className="text-center space-y-8 py-8 md:py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6 mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-relaxed py-2">
              About Megaskyshop
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed py-1">
              A leading e-commerce platform dedicated to providing high-quality products with exceptional service and
              lightning-fast delivery.
            </p>
          </div>
          <Image
            src="https://www.jebchaho.com/cdn/shop/collections/Durex.webp"
            alt="Megaskyshop Office"
            width={1200}
            height={400}
            className="rounded-2xl shadow-2xl mt-8"
          />
        </motion.section>

        {/* Story Section */}
        <motion.section className="grid md:grid-cols-2 gap-12 items-center" {...fadeIn}>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
              <Building2 className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="text-3xl font-bold text-foreground">From Vision to Reality</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded in 2023, Megaskyshop started with a vision to revolutionize the online shopping experience in
              Bangladesh. We began with a small team of passionate individuals committed to bringing the best products
              to our customers.
            </p>
            <Button variant="outline" className="group">
              Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <Card className="p-6 bg-card shadow-xl">
            <div className="grid gap-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-muted">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Customer-Centric</h3>
                  <p className="text-sm text-muted-foreground">
                    We prioritize our customers' needs and strive to exceed their expectations.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-muted">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Quality First</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer a curated selection of products that meet our high standards.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-muted">
                  <Rocket className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    We continuously seek new ways to improve our platform and services.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Customer Feedback Section */}
        <motion.section className="text-center space-y-12 py-4" {...fadeIn}>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Customer Feedback</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our valued customers have to say about their shopping experience with us.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex justify-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-4">
                  "Excellent service and fast delivery. The product quality exceeded my expectations. Will definitely shop here again!"
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold">Sarah Rahman</h3>
                <p className="text-sm text-muted-foreground">Verified Buyer</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex justify-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-4">
                  "Great customer support! They helped me track my order and were very responsive. The product arrived in perfect condition."
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold">Kamal Hassan</h3>
                <p className="text-sm text-muted-foreground">Verified Buyer</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex justify-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-4">
                  "Best online shopping experience! The website is easy to navigate, and the checkout process is smooth. Highly recommended!"
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold">Nadia Islam</h3>
                <p className="text-sm text-muted-foreground">Verified Buyer</p>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section className="max-w-2xl mx-auto text-center space-y-8 py-4" {...fadeIn}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
              <Mail className="w-4 h-4" />
              Get in Touch
            </div>
            <h2 className="text-3xl font-bold text-foreground">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions or feedback, please feel free to contact us. We are always here to help and look
              forward to hearing from you.
            </p>
          </div>
          <Button size="lg" className="group" asChild>
            <Link href="/contact">
              Contact Support <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.section>
      </div>
    </div>
  )
}

