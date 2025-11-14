// selectors.ts — LinkedIn Güncel Selector Seti (2025)

export const SELECTORS = {
  profile: {
    banner: "img.full-width.evi-image.ember-view",
    profilePhoto: "img.pv-member-photo-modal__img",
  },

  about: {
    container: "section.artdeco-card.pv-profile-card.break-words",
    text: "div.inline-show-more-text--is-collapsed span[aria-hidden='true']",
  },

  featured: {
    container: "section.pvs-carousel__container",
    items: "li.pvs-carousel-item",
    title: "span[aria-hidden='true']",
    image: "img",
  },

  experience: {
    container: "section#experience",
    items: "li.pvs-list__paged-list-item",
    company: "span.t-14.t-normal",
    role: "span.t-16.t-bold",
    date: "span.t-14.t-normal.t-black--light",
    logo: "img",
  },

  education: {
    container: "section#education",
    items: "li.pvs-list__paged-list-item",
    school: "span.t-16.t-bold",
    degree: "span.t-14.t-normal",
    date: "span.t-14.t-normal.t-black--light",
    logo: "img",
  },

  skills: {
    container: "section#skills",
    items: "li.pvs-list__paged-list-item",
    name: "span.mr1.t-bold",
    endorsements: "span.t-12.t-normal.t-black--light",
  },

  certificates: {
    container: "section#licenses_and_certifications",
    items: "li.pvs-list__paged-list-item",
    name: "span.t-bold",
    issuer: "span.t-14.t-normal.t-black--light",
    date: "span.t-14.t-normal.t-black--light",
    image: "img",
  },

  languages: {
    container: "section#languages",
    items: "li.pvs-list__paged-list-item",
    name: "span.t-bold",
    level: "span.t-14.t-normal.t-black--light",
  },

  activity: {
    container: "section#recent-activity",
    posts: "li.pvs-list__paged-list-item",
    text: "span[aria-hidden='true']",
    media: "img",
  },

  recommendations: {
    container: "section#recommendations",
    items: "li.pvs-list__paged-list-item",
    name: "span.t-bold",
    relation: "span.t-14.t-normal.t-black--light",
  }
};
