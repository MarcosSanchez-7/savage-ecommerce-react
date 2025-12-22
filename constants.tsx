
import { Product, Testimonial, BlogPost } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silver Chain Link',
    category: 'Accesorios',
    price: 120.00,
    originalPrice: 150.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDaMoOhSwZq64AI8vL03CYVWyL2ywRaRn1x3z0Try-WveXMivsLryrjK8twJINNWWiYgqjQzfkgrhbgFVBXSlMc4DRabmGZZSnuG9Ev2tUmVyoAvqC4klSLVHANmSMVegRK8bANN-MIUhqZbDuv74VtYO7tRVPGiG1VahZ0cBHW7YdBnPTg0giViiZ0wZM2-j_gV6V2F36SXpqUZPcOYj1uF5ieg59-vq3lBvg-P4eMZf7ZPZ-HSqua1sO7Txm0n5alLreCgoAnSU0'],
    sizes: ['One Size'],
    tags: ['Importado', 'Oferta'],
    isNew: true
  },
  {
    id: '2',
    name: 'Oversized Hoodie',
    category: 'Ropa',
    price: 85.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBHVb0id3bCd-jg0gOqdI1Hfl5A4JV8gHbMIqAdWV8gtA61vDlwsTJjvUV4HGMmCjy5K8B-rHXBCLVH0zlqWpJm9cNE8zjSNbISNyCMInYag9IxLzFotyhxr8TChzBiF5OlK1kqycQo0eSiveGIyWmXGvZRAE5ZWGnc-ddc42Y6nRdgdZkXVkumGeVpHVUu9XVbJE9QZJ5U8t-BelsOS2qvtYdw3r6hXKHpSmgyP-SsDf_SkyeZTHe_qDH6ObYp7mpVKUC0jWJuhNk'],
    sizes: ['S', 'M', 'L', 'XL'],
    fit: 'Oversize',
    tags: ['Nuevo']
  },
  {
    id: '3',
    name: 'Signet Ring',
    category: 'Joyas',
    price: 60.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAtQi_lE0kmw9N1EZmE4Xqj5LatnkowMOBvpH2U93fmUct-oHPAssOipizVEKjNEEg7889WKxQAKCAURF-5lyaSMcKRkOK6939GBvpZnL5V_8PkAHFvhhag-EkbgmH7qYe5p_DdCM7e3OjSXN2jnFzMoQ7EKijH5RFPgPZszdD7yxnbDfgnmezdRtM0fohCf_voy2ySVj9vuzKNhC6TvWrM-yRyXt2zoJ2gKnUfae8ZOR2MaJHILhQISkp4Z-Z97q8Uffv7IcSEQ5U'],
    sizes: ['7', '8', '9', '10'],
    tags: []
  },
  {
    id: '4',
    name: 'Denim Jacket',
    category: 'Ropa',
    price: 150.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC5toDeRgRdBwXM6nI48vl37zd_226HNmKVNNu5-Ns4WOtS8M5P5S_4sVsB2DlrnGSfntgKNmnko86bz7UbXsERkW6Rjb90oTS5q7sW6GyWSjmMHpHs7EJXJv00pFRGyjOgxh_aFJ5nC_op13-aZogCTyTZ5gvtkssmJePq995IbN9aTTsYsixgDlhs_2PiWzKBFSR8ZhfBiAF825IwO9_kM7f1DDjtoIlwFVYCUiPrJgJdbYqBHpTDHRQe8GFV_QrYzz3OgYtorYI'],
    sizes: ['M', 'L'],
    tags: ['Premium']
  },
  {
    id: '5',
    name: 'Cuban Bracelet',
    category: 'Joyas',
    price: 95.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBt-Jw6rk140zwpwaDrkEZDUeTv-8gba405berB1Qtb_2okXC9O4hpzbaoy3LPHyQqucqGvtzG4k1i20mj1xixWrWu_QscAM91geB5T6wp2vgFucS6ZPnzJ-DlH2mtAMcvFo-Q9Vcl1D5JzR2rBoJdc-EpXk6aZJ5sviyZhxGhIaeYiz72i7PBMbDE7uzTtuzBqPiqJ-xRDaHazC8lMr8d9fRGaCSxqPNnnDEgGqtWwM0Jos2kiEzRonHLG1cGXtpj4f08brQnuoZc'],
    sizes: ['One Size'],
    tags: []
  },
  {
    id: '6',
    name: 'Cargo Pants',
    category: 'Ropa',
    price: 110.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD1cCQ6-iAyjpM70VymsXbY0Kd7eik0HrjaoQ_HI92QUukvufZI5F7W5cyJ3iYonTfQAx6ferosEWnY6gDS2mpaRpGgAKSDg6oV7BIVBEUD-F5GWrOsZR3NYbPl2Z457X5M-MogwJuNh--2h01hnJJOt1WGpmgXtiBG56ZQ23nN3QgbBM5WWp3gQCOAL_0lE3TS19A4i4ZGm7388G9bXR9Sa7FSnZmwt7zZOuNQj0tqvpGt2JGE1YaItn5y7DqLjCaLmwJ4ccTWp9w'],
    sizes: ['30', '32', '34', '36'],
    tags: []
  },
  {
    id: '7',
    name: 'Skull Pendant',
    category: 'Joyas',
    price: 60.00,
    originalPrice: 75.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAVRvHOCSMUEtUcqUuiWij8KDUIgV3laaxk77Cbxb_BAClDQOhJvY7wW_wqvbzJMb8zl5j04GC5okvuDxlwEfxKsYG86azGaSavGb4Kom-5TmZNipbeRpVZhMufrK0DDGtUYmwdg-nls9lJTc3Fgamhg5q9b7TThxuwMEkAfILWhhNgU-4xNi96_yM0nqcvSGxgW5_wgnighWqc9Cu4Tp5k8MzNKvINeavfxzisRbIfljYGHE3A4pD4c755ajctDCzTuIYYLgCQAmo'],
    sizes: ['One Size'],
    tags: ['Oferta']
  },
  {
    id: '8',
    name: 'Graphic Tee',
    category: 'Ropa',
    price: 45.00,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDR7wXm4Vky-Z71j0uYlaoLppJ6G-YFCDJ_Rx_KnIDCBUQcXZVf9aMgILRGGuJhkIvzHt--21u6sMOgNUbGsx0PMWm5Gdd-zyraMVO7S7YZahx1_qaDc5ZlVMH00ghBq30DR7G34MXkEKlQ9yl5-cG5Lxe1zLc6gkLp9kgvZ4R9nfTXRFOEa-Iyx6Z91nJs1rHpGA5QOz2IXW4ZMwJRzmZ0negbyDjraTIeS4DVNDDIjbKFv_OvVyKN4n3gPaOacZpDeJxKQXZQ9so'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['Nuevo']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Alex M.',
    location: 'Madrid, ES',
    text: '"La calidad de la cadena cubana es brutal. Pesa, brilla y se siente indestructible. Definitivamente volveré a comprar."',
    rating: 5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg1q-6D6LY-QM7a7uz-y7LVfyVLhkR7gQpnJAI3fGLDLYKnUQjGOnHjtcIJ5mFTUV7FFO-mYECWw4SPR-7S6Qj93cSua60P1mr1n0KLhrZ7rN27WiHE7ceSk7JGERtGswgYWFb_JwlMyZkx2HKd3aCeVsuOoadiHuVsLolMofrR4qQGLJIgYUscbfRRUkgnGfkAU-TXQUXmvq_5DDH_t34W9ffQXI2KSy9HThvkU7JoUAwXqN-X2OMSsY5iaopZ1D0x4rNludfoEY'
  },
  {
    id: 't2',
    name: 'Sofia R.',
    location: 'Barcelona, ES',
    text: '"Envío rapidísimo y el packaging es otro nivel. La sudadera oversize tiene el corte perfecto."',
    rating: 5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCe8pJOarFXw7cWNxAfSrVtNSsYEh0C3YFTcUWNfJDnlNgbci-xvaxwyl7PhAvGniam6D_QObpKqK_Kop6I6-QwmGWFhafpesLCQKxsgt--wXziIkpN9Tkry-O2HNVFpyg2JefHpJ7nu43eGnobxUUPGsniy3iLheCrPYDguiq-V3Dks9ZFjqSYH1AOu6KRmlFuAl0AvwYq16hz1clmDqX1yAYs5TxeJ6FHlzT9ogZmo21HPXpF_ESBQhrmMvHgpl73tauHdUE52s'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    tag: 'Tendencias',
    title: 'Neon Nights: El regreso del cyberpunk urbano',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrzxb_Bz-zs3pTHKrlF7Qkx4jKtBz0_A0opoohRWkaDk0uJ_WPxWlERyeJ_53wmdtrJqbGHp2oNZLgkNgpEAt47tnt_JJgE_zRFjnQ5E73osQbwsPWwqKTEYcamrDEZfDfEyi5D2lqfCzzdPj2TbNoRpnYb4rhU5TovodkUnOE7ZWrTeaNoSLHn9aCazx_QF1rFvaWbutjCm5uokxn1I-EjppTnWb_M4h3qDhg7eVm3jQRUXK8JVyvOr5v6InU5-M5XTZFSKe3XDA',
    linkText: 'Leer artículo',
    link: '#'
  },
  {
    id: 'b2',
    tag: 'Guía',
    title: 'Cómo cuidar tu joyería de plata',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJW7C5fFdDesPWXj0cYImXwKklr1Yl81ZfVE5xWQF86BPN6eHVjZfCUryVtZMMGZkF5Ev1DCr_pPTVLQwAbLgG1C5EA3VB3Z_Ak0l1px7mAehv1Omnw5s8m0hyMo-xKOtGM2_Kr0aQFqXO0_qJM_UO5vUY3_U-LjJtpdW-6eM8Jssgpjlkr3Pumpus3FBVvfbOd6jT6eh257I7STn37sjVyZtZRGFbJHy7KQlObCfOnP4SH1l87rgNVdlwoe501b5XRrL1ON3icDo',
    linkText: 'Leer artículo',
    link: '#'
  }
];
