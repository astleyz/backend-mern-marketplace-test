import cheerio from 'cheerio';
import got from 'got';
import config from '../config';
import type { CourseSchemaType } from '../models/course';

type UdemyCourse = Omit<CourseSchemaType, '_id'>;

export async function fetchUdemyCourseAndParse(link: string): Promise<UdemyCourse> {
  try {
    const response = await got(link, { headers: config.gotHeaders });
    const $ = cheerio.load(response.body);

    let course: UdemyCourse = <any>{};
    course.id = new URL(link).pathname.match(/(?<=\/)[\w-]+(?=\/?$)/g)![0];
    course.title = $('title').text().split(' | Udemy')[0];
    course.subTitle = $('.udlite-text-md.clp-lead__headline').text().trim();
    course.img = $('.intro-asset--img-aspect--1UbeZ img')[0]
      .attribs.srcset.split(',')[1]
      .split(' ')[1];
    course.authors = $('.instructor-links--names--7UPZj > span').text();
    course.authorNames = <any>$('.instructor-links--names--7UPZj > a > span')
      .map((i, el) => $(el).text())
      .get();
    course.whatWillYouLearn = <any>{};
    course.whatWillYouLearn.title = $('.what-you-will-learn--title--hropy').text();
    course.whatWillYouLearn.items = <any>$('.what-you-will-learn--objective-item--ECarc')
      .map((i, el) => $(el).text())
      .get();
    const rBlock = $('.ud-component--course-landing-page-udlite--requirements');
    course.requirements = <any>{};
    course.requirements.title = rBlock.find('.udlite-heading-xl.requirements--title--2j7S2').text();
    course.requirements.items = <any>rBlock
      .find('.udlite-block-list-item-content')
      .map((i, el) => $(el).text())
      .get();
    const dBlock = $('.udlite-text-sm.styles--description--3y4KY');
    course.description = <any>{};
    course.description.title = dBlock.find('.styles--description__header--3SNsO').text();
    course.description.html = <any>(
      dBlock.find('[data-purpose="safely-set-inner-html:description:description"]').html()
    );
    course.forWho = <any>{};
    course.forWho.title = dBlock.find('.udlite-heading-xl.styles--audience__title--1Sob_').text();
    course.forWho.items = <any>dBlock
      .find('.styles--audience__list--3NCqY')
      .children()
      .map((i, el) => $(el).text())
      .get();
    const lBlock = $('div[data-purpose="course-curriculum"]');
    course.materials = <any>{};
    course.materials.title = lBlock.find('h2[data-purpose="curriculum-header"]').text();
    course.materials.info = lBlock.find('.curriculum--content-length--1XzLS').text();
    course.materials.sections = <any>lBlock
      .find('.section--panel--1tqxC')
      .map((i, el) => {
        const lesson = <any>{};
        lesson.title = $(el).find('.section--section-title--8blTh').text();
        lesson.fullLength = $(el).find('.section--section-content--9kwnY').text();
        const ul = $(el).find('.unstyled-list.udlite-block-list');
        lesson.lessons = [];
        $(ul)
          .children()
          .map((_, it) => {
            const lessonItem = <any>{};
            lessonItem.name = $(it).find('.section--item-title--2k1DQ').text();
            lessonItem.length = $(it).find('.section--item-content-summary--126oS').text();
            lesson.lessons.push(lessonItem);
          });
        return lesson;
      })
      .get();
    const instrBox = $('.styles--instructors--2JsS3');
    course.instructor = <any>{};
    course.instructor.title = instrBox.find('.styles--instructors__header--16F_8').text();
    course.instructor.names = <any>instrBox
      .find('.instructor--instructor__title--34ItB a')
      .map((i, el) => $(el).text())
      .get();
    course.instructor.jobs = <any>instrBox
      .find('.instructor--instructor__job-title--1HUmd')
      .map((i, el) => $(el).text())
      .get();
    course.instructor.coursesQuantity = instrBox
      .find('ul.unstyled-list.udlite-block-list > li:last-child .udlite-block-list-item-content')
      .map((i, el) => (i === 0 ? $(el).text() : null))
      .get()
      .toString();
    course.instructor.aboutme = <any>(
      instrBox.find('.instructor--instructor__description--1dHxF').html()
    );

    return course;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
