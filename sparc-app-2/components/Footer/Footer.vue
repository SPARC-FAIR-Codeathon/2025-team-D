<template>
  <div class="footer">
    <div class="container">
      <el-row :gutter="32">
        <el-col :sm="{ span: 22, offset: 1 }" :md="{ span: 12, offset: 0 }">
          <div class="footer__info">
            <div class="footer__info--logo">
              <nuxt-link :to="{ name: 'index' }">
                <client-only><sparc-logo /></client-only>
              </nuxt-link>
            </div>
            <div class="footer__info--blurb">
              <p>
                {{ footerData.footerDescription }}
              </p>
            </div>
            <div class="footer__info--social">
              <a href="https://bsky.app/profile/sparc.science" target="_blank">
                <svgo-icon-bluesky class="social-media-icon pr-16"/>
              </a>
              <a
                href="https://www.linkedin.com/groups/12694019"
                target="_blank"
              >
                <svgo-icon-linkedin class="social-media-icon pr-16"/>
              </a>
              <a
                href="https://www.youtube.com/channel/UCCmUx4tOSlTAwlUrjSGz2mw"
                target="_blank"
              >
                <svgo-icon-youtube class="social-media-icon"/>
              </a>
            </div>
            <span>
              <span class="footer__info--re3data mr-32">
                <a href="https://doi.org/10.17616/R31NJN2V" target="_blank">
                  <img class="mb-32" src="/100013719.svg" alt="re3data badge"/>
                </a>
              </span>
              <a href="https://registry.opendata.aws/sparc/"><img class="mb-32" src="https://d0.awsstatic.com/logos/powered-by-aws.png" alt="Powered by AWS Cloud Computing"></a>
            </span>
          </div>
        </el-col>
        <el-col :sm="{ span: 22, offset: 1 }" :md="{ span: 8, offset: 4 }">
          <div class="footer__links">
            <el-row :gutter="32">
              <el-col :span="12">
                <h3>Learn More</h3>
                <ul>
                  <li
                    v-for="learnMoreLink in footerData.learnMoreLinks"
                    :key="learnMoreLink.fields.url"
                  >
                    <footer-link :link="learnMoreLink" />
                  </li>
                </ul>
              </el-col>
              <el-col :span="12">
                <h3>Policies</h3>
                <ul>
                  <li
                    v-for="policiesLink in footerData.policiesLinks"
                    :key="policiesLink.fields.url"
                  >
                    <footer-link :link="policiesLink" />
                  </li>
                </ul>
              </el-col>
            </el-row>
            <el-row :gutter="32">
              <el-col :span="12">
                <h3>Help Us Improve</h3>
                <ul>
                  <li
                    v-for="helpUsImproveLink in footerData.helpUsImproveLinks"
                    :key="helpUsImproveLink.fields.url"
                  >
                    <footer-link :link="helpUsImproveLink" />
                  </li>
                </ul>
              </el-col>
              <el-col :span="12">
                <h3>Stay Up-to-Date</h3>
                <ul>
                  <li
                    v-for="stayUpdatedLink in footerData.stayUpdatedLinks"
                    :key="stayUpdatedLink.fields.url"
                  >
                    <footer-link :link="stayUpdatedLink" />
                  </li>
                </ul>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import FooterLink from './FooterLink.vue'
import { useMainStore } from '../store/index.js'
import SparcLogo from 'sparc-design-system-components-2/src/components/SparcLogo'

export default {
  name: 'SparcFooter',
  components: {
    FooterLink,
    SparcLogo
  },
  computed: {
    ...mapState(useMainStore, ['footerData'])
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.footer {
  display: flex;
  flex-direction: row;
  padding: 2rem 1rem;
  background-color: #F8FAFF;

  .social-media-icon {
    color: #606266;
    font-size: 2rem;
  }

  .footer__info {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }

  &__info {
    &--logo {
      height: 4rem;
    }

    &--blurb {
      p {
        font-size: 1rem;
        font-weight: normal;
        line-height: 2rem;
        color: $mediumGrey;
      }
    }

    &--social {
      .svg-icon {
        width: 2.2rem;
        margin-right: 1rem;
      }
    }
  }

  &__links {
    h3 {
      font-size: 1rem;
      font-weight: bold;
      line-height: 2rem;
      color: $mediumGrey;
    }
    ul {
      list-style: none;
      padding-left: 0;

      li {
        padding-bottom: 1rem;
      }

      a {
        color: $mediumGrey;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@media screen and (max-width: 991px) {
  .footer {
    &__info {
      gap: 1rem;
      &--logo {
        height: fit-content;
      }

      &--blurb {
        font-size: 0.75rem;
        font-weight: normal;
        line-height: 1.25rem;
      }
    }
  }
}

.footer__info--logo {
  img {
    height: 4rem;
    width: 8rem;
  }
}
</style>
