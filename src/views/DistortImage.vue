<template>
  <main>
    <div data-scroll>
      <div class="page">
        <header>
          <h1>Oceans</h1>
          <img src="../assets/distort-image/header.jpg" alt="" />
        </header>
        <!-- BEGIN grid -->
        <div class="grid">
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/octopuses-punch-fish.html"
            class="item item_v"
          >
            <div class="item__image">
              <img src="../assets/distort-image/1.jpg" alt="" />
              <div class="item__meta">December 23, 2020</div>
            </div>

            <h2 class="item__title">
              Octopus punches fish in the head (just because it can)
            </h2>
            <p>
              Octopuses sometimes partner with fish to hunt, but the partnership
              comes with risks (for the fish, that is).
            </p>
          </a>
          <!-- END item -->
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/balloon-like-comb-jelly-discovered-puerto-rico.html"
            class="item item_h"
          >
            <div class="item__image">
              <img src="../assets/distort-image/2.jpg" alt="" />
              <div class="item__meta">December 01, 2020</div>
            </div>

            <h2 class="item__title">
              Newfound marine blob looks like 'party balloon' with two strings,
              scientists say
            </h2>
            <p>
              This is the first species NOAA scientists have ever discovered
              from video footage alone.
            </p>
          </a>
          <!-- END item -->
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/largest-recorded-swarm-of-deep-sea-fish.html"
            class="item item_h"
          >
            <div class="item__image">
              <img src="../assets/distort-image/4.jpg" alt="" />
              <div class="item__meta">November 26, 2020</div>
            </div>

            <h2 class="item__title">Swarm of eels breaks record</h2>
            <p>
              Before we start mining for precious metals in the darkness of the
              deep sea, we might try switching on the light first and observing
              our surroundings.
            </p>
          </a>
          <!-- END item -->
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/mantis-shrimp-property-wars.html"
            class="item item_v"
          >
            <div class="item__image">
              <img src="../assets/distort-image/3.jpg" alt="" />
              <div class="item__meta">November 03, 2020</div>
            </div>

            <h2 class="item__title">Mantis shrimp punch down</h2>
            <p>Home-stealers fought the hardest for smaller-than-ideal dens.</p>
          </a>
          <!-- END item -->

          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/megalodon-big-for-a-shark.html"
            class="item item_v"
          >
            <div class="item__image">
              <img src="../assets/distort-image/1.jpg" alt="" />
              <div class="item__meta">October 05, 2020</div>
            </div>

            <h2 class="item__title">Megalodon's hugeness</h2>
            <p>
              Even among its extinct relatives, Megalodon was unequalled in
              length and mass.
            </p>
          </a>
          <!-- END item -->
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/tiny-sunfish-larva.html"
            class="item item_h"
          >
            <div class="item__image">
              <img src="../assets/distort-image/2.jpg" alt="" />
              <div class="item__meta">July 27, 2020</div>
            </div>

            <h2 class="item__title">Adorable sunfish</h2>
            <p>
              Sunfish in the Molidae family are among the biggest fish in the
              world.
            </p>
          </a>
          <!-- END item -->
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/supergiant-isopod-newfound-species.html"
            class="item item_h"
          >
            <div class="item__image">
              <img src="../assets/distort-image/4.jpg" alt="" />
              <div class="item__meta">August 18, 2020</div>
            </div>

            <h2 class="item__title">Massive 'Darth Vader' sea bug</h2>
            <p>
              The newly described species is one of the biggest isopods known to
              science.
            </p>
          </a>
          <!-- END item -->
          <!-- BEGIN item -->
          <a
            href="https://www.livescience.com/worlds-deepest-octopus.html"
            class="item item_v"
          >
            <div class="item__image">
              <img src="../assets/distort-image/3.jpg" alt="" />
              <div class="item__meta">June 01, 2020</div>
            </div>

            <h2 class="item__title">
              Scientists capture the world's deepest octopus
            </h2>
            <p>The octopus was found miles beneath the ocean surface.</p>
          </a>
          <!-- END item -->
        </div>
        <!-- END grid -->

        <!-- BEGIN footer -->
        <footer class="footer">
          <p>
            &copy; all news from
            <a href="https://www.livescience.com/topics/ocean">LiveScience</a>
          </p>
          <p>
            This page was made for
            <a
              href="https://www.awwwards.com/academy/course/merging-webgl-and-html-worlds"
              >Merging WebGL and HTML course on Awwwards.com</a
            >
            <br />Wish you a good day! =)
          </p>
        </footer>
        <!-- END footer -->
      </div>
      <!-- end page -->
    </div>
    <!-- end scroll -->
  </main>
  <div class="distort-image fixed -z-1 inset-0 w-screen h-screen"></div>
</template>

<script lang="ts">
import DistortImage from "@/scenes/distortImage";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "DistortImage",
  setup() {
    const start = () => {
      const distortImage = new DistortImage(".distort-image", true);
      distortImage.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style scoped>
.page {
  width: min(90%, 1200px);
  margin: 0 auto;
}
/* header */

header {
  margin-bottom: 5em;
  position: relative;
}
h1 {
  font-size: 260px;
  line-height: 1;
  padding: 0.5em 0;
  text-align: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #047582;
  mix-blend-mode: color-burn;
  font-size: 18vw;
  margin: 0;
}
header img {
  max-width: 100%;
  display: block;
  opacity: 0;
}
h1,
h2 {
  font-family: "Playfair Display", serif;
  font-weight: normal;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 2em 0;
}

.item {
  align-self: center;
  justify-self: center;
  text-decoration: none;
  color: #333;
}
.item:nth-child(odd) {
  justify-self: start;
}
.item:nth-child(even) {
  justify-self: end;
}
.item img {
  width: 100%;
  display: block;
  opacity: 0;
}
.item__image {
  position: relative;
  margin-bottom: 0.6em;
}
.item__meta {
  position: absolute;
  left: -0.4em;
  bottom: 0.4em;
  transform-origin: 0 100%;
  transform: rotate(-90deg);
  text-transform: uppercase;
  font-size: 80%;
}
.item__title {
  font-size: 40px;
  line-height: 1.2;
  margin-bottom: 0.4em;
}
.item_p {
  line-height: 1.4;
  font-size: 1em;
}
.item_h {
  width: 100%;
}
.item_v {
  width: 80%;
}

/* footer */
.footer {
  border-top: 1px solid #ccc;
  padding: 1em;
  font-size: 15px;
  display: flex;
  margin-top: 8em;
  line-height: 1.5;
  padding: 1em 0 4em 0;
}
.footer a {
  color: #333;
}
.footer p + p {
  margin-left: auto;
  text-align: right;
}

@media screen and (max-width: 600px) {
  .grid {
    display: block;
  }
  .item_v,
  .item_h {
    width: auto;
    margin-bottom: 3em;
  }
  .item img {
    width: 100%;
    max-width: none;
  }
}
</style>
